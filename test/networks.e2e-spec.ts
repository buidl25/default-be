import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DbService } from '../prisma/src/db.service';
import { PrismaService } from '../prisma/src/prisma.service';
import { ProvisioningService } from '../src/provisioning/provisioning.service';

// In-memory store to simulate Prisma DB
interface NetworkEntity {
  id: number;
  name: string;
  status: string;
  endpoints: string | null; // stored as JSON string in DB
  chainId?: number | null;
  ownerId: number;
  owner?: { id: number; name?: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
}

describe('Networks E2E', () => {
  let app: INestApplication;

  // Simple in-memory DB simulation
  let idCounter = 1;
  let networks: NetworkEntity[] = [];

  const mockDb: Partial<DbService> = {
    // emulate prisma.network namespace
    network: {
      create: jest.fn(async ({ data, include }: any) => {
        // conflict on name (simulate P2002)
        if (networks.some((n) => n.name === data.name)) {
          const err: any = new Error(
            'Unique constraint failed on the fields: (`name`)',
          );
          err.code = 'P2002';
          throw err;
        }
        const now = new Date();
        const entity: NetworkEntity = {
          id: idCounter++,
          name: data.name,
          status: data.status ?? 'pending',
          endpoints: data.endpoints ?? null,
          chainId: data.chainId ?? null,
          ownerId: data.ownerId,
          owner: include?.owner
            ? { id: data.ownerId, name: 'Test Owner' }
            : null,
          createdAt: now,
          updatedAt: now,
        };
        networks.push(entity);
        return entity;
      }),
      findMany: jest.fn(async ({ include }: any) => {
        if (include?.owner) {
          return networks.map((n) => ({
            ...n,
            owner: { id: n.ownerId, name: 'Test Owner' },
          }));
        }
        return networks;
      }),
      findUnique: jest.fn(async ({ where, include }: any) => {
        const n = networks.find((x) => x.id === where.id);
        if (!n) return null;
        if (include?.owner) {
          return { ...n, owner: { id: n.ownerId, name: 'Test Owner' } };
        }
        return n;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const idx = networks.findIndex((x) => x.id === where.id);
        if (idx === -1) throw new Error('Not found');
        const updated = {
          ...networks[idx],
          ...data,
          updatedAt: new Date(),
        } as NetworkEntity;
        networks[idx] = updated;
        return updated;
      }),
    },
  } as any;

  const mockProvisioning: Partial<ProvisioningService> = {
    triggerProvisioning: jest.fn(
      async (networkId: number) => `job-${networkId}`,
    ),
    checkProvisioningStatus: jest.fn(async () => ({ status: 'completed' })),
  } as any;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Prevent real DB connects and provide our in-memory prisma
      .overrideProvider(DbService)
      .useValue(mockDb)
      .overrideProvider(PrismaService)
      .useValue(mockDb)
      .overrideProvider(ProvisioningService)
      .useValue(mockProvisioning)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // reset store between tests
    idCounter = 1;
    networks = [];
    jest.clearAllMocks();
  });

  it('POST /networks creates a network and triggers provisioning', async () => {
    const payload = {
      name: 'My EVM Network',
      ownerId: 1,
      chainId: 1337,
      endpoints: { rpc: 'https://rpc.example.com' },
    };

    const res = await request(app.getHttpServer())
      .post('/networks')
      .send(payload)
      .expect(201);

    // Response shape assertions
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: payload.name,
      status: 'pending',
      endpoints: payload.endpoints,
      chainId: payload.chainId,
      ownerId: payload.ownerId,
      ownerName: 'Test Owner',
    });

    // Provisioning triggered with the created network id
    expect(mockProvisioning.triggerProvisioning).toHaveBeenCalledTimes(1);
    const createdId = res.body.id;
    expect(mockProvisioning.triggerProvisioning).toHaveBeenCalledWith(
      createdId,
      expect.any(Object),
    );

    // DB update to store job id in endpoints should have been attempted
    expect((mockDb.network as any).update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: createdId } }),
    );
  });

  it('POST /networks returns 409 on duplicate name (P2002)', async () => {
    const payload = { name: 'dup', ownerId: 1 };
    await request(app.getHttpServer())
      .post('/networks')
      .send(payload)
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/networks')
      .send(payload)
      .expect(409);
    expect(res.body.message).toBe('Network with this name already exists');
  });

  it('GET /networks returns list', async () => {
    // seed
    await request(app.getHttpServer())
      .post('/networks')
      .send({ name: 'n1', ownerId: 1 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/networks')
      .send({ name: 'n2', ownerId: 2 })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/networks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('ownerName');
  });

  it('GET /networks/:id returns 404 if not found', async () => {
    await request(app.getHttpServer()).get('/networks/999').expect(404);
  });

  it('GET /networks/:id returns the network', async () => {
    const create = await request(app.getHttpServer())
      .post('/networks')
      .send({ name: 'found', ownerId: 1 })
      .expect(201);
    const id = create.body.id;

    const res = await request(app.getHttpServer())
      .get(`/networks/${id}`)
      .expect(200);
    expect(res.body).toMatchObject({ id, name: 'found', ownerId: 1 });
  });
});
