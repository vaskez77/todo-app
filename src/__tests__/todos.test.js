const request = require('supertest');
const app = require('../app');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const db = require('../db');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /health', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/todos', () => {
  it('returns list of todos', async () => {
    db.query.mockResolvedValue({
      rows: [{ id: 1, title: 'Test todo', completed: false }],
    });
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Test todo');
  });

  it('returns 500 on db error', async () => {
    db.query.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/todos', () => {
  it('creates a todo', async () => {
    db.query.mockResolvedValue({
      rows: [{ id: 2, title: 'New todo', completed: false }],
    });
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'New todo' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New todo');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('updates completed status', async () => {
    db.query.mockResolvedValue({
      rows: [{ id: 1, title: 'Test', completed: true }],
    });
    const res = await request(app)
      .patch('/api/todos/1')
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 when todo not found', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(app)
      .patch('/api/todos/999')
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it('returns 400 when completed is not boolean', async () => {
    const res = await request(app)
      .patch('/api/todos/1')
      .send({ completed: 'yes' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo', async () => {
    db.query.mockResolvedValue({
      rows: [{ id: 1 }],
    });
    const res = await request(app).delete('/api/todos/1');
    expect(res.status).toBe(204);
  });

  it('returns 404 when todo not found', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(404);
  });
});