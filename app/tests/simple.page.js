import { Selector, t } from 'testcafe';
import { PAGE_IDS } from '../imports/ui/utilities/PageIDs';

/** Create an instance of a SimplePage when all you need to do is verify that the page was displayed. */
class SimplePage {
  constructor(id) {
    this.pageId = `#${id}`;
    this.pageSelector = Selector(this.pageId);
  }

  /** Asserts that this page is currently displayed. */
  async isDisplayed() {
    // From https://testcafe.io/documentation/402803/recipes/best-practices/create-helpers
    // Note that this file imports t (the test controller) from the testcafe module. You don’t need to pass t to helper functions because TestCafe can resolve the current test context and provide the correct test controller instance.
    await t.expect(this.pageSelector.exists).ok();
  }
}

export const manageDatabasePage = new SimplePage(PAGE_IDS.MANAGE_DATABASE);
export const signOutPage = new SimplePage(PAGE_IDS.SIGN_OUT);
export const studentRequestPage = new SimplePage(PAGE_IDS.STUDENT_REQUESTS);
export const facultyRequestPage = new SimplePage(PAGE_IDS.FACULTY_REQUESTS);
export const adminManagePage = new SimplePage(PAGE_IDS.ADMIN_MANAGE);
export const profilePage = new SimplePage(PAGE_IDS.PROFILE);
export const roomListPage = new SimplePage(PAGE_IDS.ROOM_LIST);
export const facultyInformationPage = new SimplePage(PAGE_IDS.FACULTY_INFORMATION);
export const clubInformationPage = new SimplePage(PAGE_IDS.CLUB_INFORMATION);
