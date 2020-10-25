import { Message, User } from './message';

describe('Message', () => {
  it('should create an instance', () => {
    expect(new Message(User.client, [])).toBeTruthy();
  });
});
