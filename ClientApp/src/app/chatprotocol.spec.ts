import { Chatprotocol } from './chatprotocol';

describe('Chatprotocol', () => {
  it('should create an instance', () => {
    expect(new Chatprotocol("message", "")).toBeTruthy();
  });
});
