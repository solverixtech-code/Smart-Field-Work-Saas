import { runWorkerLoop } from './worker-loop';

describe('Separate worker shutdown contract', () => {
  it('stops claiming and waits for the already-running handler to finish', async () => {
    const shutdown = new AbortController();
    let finish: (value: boolean) => void = () => { throw new Error('Handler not started'); };
    const tick = jest.fn(() => new Promise<boolean>((resolve) => { finish = resolve; }));
    const pending = runWorkerLoop({ tick }, { write: jest.fn() }, shutdown.signal);
    expect(tick).toHaveBeenCalledTimes(1);
    shutdown.abort();
    let stopped = false;
    void pending.then(() => { stopped = true; });
    await Promise.resolve(); expect(stopped).toBe(false);
    finish(true); await pending;
    expect(stopped).toBe(true); expect(tick).toHaveBeenCalledTimes(1);
  });
  it('does not claim on an already-stopped worker', async () => {
    const shutdown = new AbortController(); shutdown.abort();
    const tick = jest.fn();
    await runWorkerLoop({ tick }, { write: jest.fn() }, shutdown.signal);
    expect(tick).not.toHaveBeenCalled();
  });
});
