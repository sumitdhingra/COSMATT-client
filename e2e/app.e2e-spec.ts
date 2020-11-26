import { CosmattPage } from './app.po';

describe('cosmatt App', function() {
  let page: CosmattPage;

  beforeEach(() => {
    page = new CosmattPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
