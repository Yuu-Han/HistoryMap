chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      // if ( // Protect against errors in form. 
      //   request.data &&
      //   request.data.changeInfo &&
      //   request.data.changeInfo.url
      // ) {
      //   console.log("page updated - URL: ", request.data);
      // }
      // There are a few update events when a new page is loaded. changeInfo.status === 'complete' is when the page loading finishes.
      if (
        // Protect against errors in form.
        // request.data &&
        // request.data.changeInfo &&
        // request.data.changeInfo.status === "complete"
        request.data &&
        request.data.changeInfo &&
        request.data.changeInfo.url
      ) {
        // debug
        console.log("page updated Complete: ", request.data);

        let newPageId = window.crypto.randomUUID();

        // check if a page opened in this tab before
        // let parentTab = hmTabs.find((t) => t.tabId === request.data.tabID); // NOTE: tabID is not the same case
        // let parentPageId;

        // // create a hmTab object if this is a new tab
        // if (!parentTab) {
        //   let newTab = new hmTab(request.data.tabID, newPageId);
        //   hmTabs.push(newTab);

          // if the tab is opened by another tab, the 'openerTabId' property will be set
          let parentTabId = request.data.tab.openerTabId;
          if (parentTabId) {
            // Find the parent page

            // --- Kai: how is this different from the previous code?
            const page = hmPages.findLast((p) => p.tabId == parentTabId);
            parentPageId = page ? page.pageId : null;
            // ---
          } else {
            parentPageId = null;
          }
        // } else {
        //   parentPageId = parentTab.lastPageId;
        // }

        // Create a new hmPage object
        let newPage = new hmPage(
          newPageId,
          request.data.tabID,
          new Date(),
          request.data.tab,
          parentPageId
        );

        hmPages.push(newPage);

        // Map page data to tree data
        displayTree(hmPages);
        // displayTree2(hmPages);
      }
   }
);


// When the window is open, the History Map is open
window.addEventListener("DOMContentLoaded", function () {
  toggle_badge("Open");
});

window.addEventListener("beforeunload", function () {
  toggle_badge("Off");
});


async function toggle_badge(state) {
  chrome.action.setBadgeText({
    text: state,
  });
}