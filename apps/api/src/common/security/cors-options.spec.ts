import { Controller, Get, INestApplication, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { createCorsOptions } from "./cors-options";

@Controller()
class CorsProbeController {
  @Get("probe")
  probe() {
    return { ok: true };
  }
}

@Module({ controllers: [CorsProbeController] })
class CorsProbeModule {}

describe("Bootstrap CORS policy through the Nest HTTP adapter", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CorsProbeModule],
    }).compile();
    app = module.createNestApplication();
    app.enableCors(createCorsOptions("https://approved.example"));
    await app.init();
  });

  afterAll(async () => app.close());

  it.each([
    "https://approved.example",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://192.168.1.20:5173",
    "http://10.2.3.4:3000",
  ])("preserves credentialed access for approved origin %s", async (origin) => {
    await request(app.getHttpServer())
      .get("/probe")
      .set("Origin", origin)
      .expect(200)
      .expect("Access-Control-Allow-Origin", origin)
      .expect("Access-Control-Allow-Credentials", "true");
  });

  it.each([
    "https://unapproved.example",
    "https://approved.example.evil.example",
    "http://localhost.evil.example:5173",
    "http://192.168.1.20.evil.example:5173",
    "http://10.2.3.4@evil.example:3000",
    "https://localhost:5173",
    "null",
  ])("does not grant simple requests or preflights from %s", async (origin) => {
    const simple = await request(app.getHttpServer())
      .get("/probe")
      .set("Origin", origin)
      .expect(200);
    const preflight = await request(app.getHttpServer())
      .options("/probe")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "DELETE");
    for (const response of [simple, preflight]) {
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
      expect(
        response.headers["access-control-allow-credentials"],
      ).toBeUndefined();
      expect(response.headers["access-control-allow-methods"]).toBeUndefined();
    }
  });

  it("preserves approved preflight methods and headers", async () => {
    const response = await request(app.getHttpServer())
      .options("/probe")
      .set("Origin", "https://approved.example")
      .set("Access-Control-Request-Method", "DELETE")
      .expect(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://approved.example",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toBe(
      "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
    );
    expect(response.headers["access-control-allow-headers"]).toBe(
      "Content-Type,Authorization,X-Requested-With,Accept,Origin,X-Correlation-Id",
    );
  });

  it("preserves requests with no Origin header", async () => {
    const response = await request(app.getHttpServer())
      .get("/probe")
      .expect(200, { ok: true });
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("denies arbitrary origins when FRONTEND_URL is absent", () => {
    const origin = createCorsOptions(undefined).origin;
    if (typeof origin !== "function")
      throw new Error("Expected origin callback");
    const callback = jest.fn();
    origin("https://unapproved.example", callback);
    expect(callback).toHaveBeenCalledWith(null, false);
  });
});
