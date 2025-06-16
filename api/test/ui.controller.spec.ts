import { UIController } from '../src/controllers/ui.controller';

describe('UIController', () => {
  let controller: any;

  beforeEach(() => {
    controller = new UIController();
  });

  describe('constructor', () => {
    it('should create an instance of UIController', () => {
      expect(controller).toBeInstanceOf(UIController);
    });
  });
});
