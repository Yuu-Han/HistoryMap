sm.provenance.browser = function() {
	
	/* Delcare Variables */
	
	var count = 0;
    const module = {};
	var recordIDs = {};
	var recordNodeID = {};
	var recordNodeCounter = {};
	var recordNodeTime = {};
	var recordNodeLock = {};
	var recordNodeHasChild = {};
	
    const ignoredUrls = [
        'chrome://',
        'chrome-extension://',
        'chrome-devtools://',
        'view-source:',
        'google.co.uk/url',
        'google.com/url',
        'localhost://'
    ],
    
	bookmarkTypes = [ 'auto_bookmark' ],
    typedTypes = [ 'typed', 'generated', 'keyword', 'keyword_generated' ];
    const dispatch = d3.dispatch('dataChanged');
	
	/* Initialize Functions */
	
    onTabUpdate();
	onTabCreation();


	function onTabCreation() {
		chrome.tabs.onCreated.addListener( function( tab) {
		  if (tab.openerTabId && (tab.url.indexOf("chrome://newtab/") == -1)){
			var pid = tab.openerTabId;	
		  }  
		  if(pid) {
			recordIDs[tab.id] = pid;
		  } else {
			recordIDs[tab.id] = tab.id;
			addAction(tab,tab.id,0);
		  }
		});
	}

    function onTabUpdate() {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			
			if (isTabIgnored(tab) || isTabInComplete(tab)) return;

			if(changeInfo.status === undefined || changeInfo.status === null) return;
			
			if(recordNodeLock[tabId] == 1) {  
				if(recordNodeHasChild[tabId] == 1) {  
					addAction(tab,tabId,1);
				} else {
					updateAction(tab,tabId);
				}
			} else {
				addAction(tab,tabId,1);
			}
        });
    }
	
	/* Support Functions */
	
	function updateAction(tab,tabId) {
			
		action = {
			id: recordNodeID[tabId],
			time: recordNodeTime[tabId],
			url: tab.url,
			text: tab.title || tab.url || '',
			type: "link",
			favIconUrl: tab.favIconUrl,
			counter: recordNodeCounter[tabId],
			from: recordNodeID[recordIDs[tabId]]
		};
		dispatch.dataChanged(action);			
		recordNodeLock[tabId] = 0; 	
	}
	
	function addAction(tab,tabId,hasChild) {
		
			const time = new Date(),
			
			action = {
				id: +time,
				time: time,
				url: tab.url,
				text: tab.title || tab.url || '',
				type: "link",
				favIconUrl: tab.favIconUrl,
				counter: count,
				from: recordNodeID[recordIDs[tabId]]
			};
			
			recordNodeID[tabId] = +time;
			recordNodeTime[tabId] = time;
			recordNodeCounter[tabId] = count;
			recordNodeLock[tabId] = 1;
			
			if(hasChild==1) {
				recordNodeHasChild[recordIDs[tabId]] = 1;
			}
		
			dispatch.dataChanged(action);
			count++;
		
	}
	
	
	/* Additional Functions for Checking */
	
    function isTabInComplete(tab) {
        return tab.status !== 'complete';
    }

    function isTabIgnored(tab) {
        return ignoredUrls.some(url => tab.url.includes(url));
    }

    d3.rebind(module, dispatch, 'on');
    return module;
};
