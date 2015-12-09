// on save need to add new quicklink to top of view list

document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('save');
  var input = document.getElementById('codeInput');
  var viewButton = document.getElementById('view');
  var viewDiv = document.getElementById('show');
  var currentPageDiv = document.getElementById('currentPageLink');
  var pageHasLink = false;
  var ul = document.createElement('ul');
  var savedAlert = createSavedAlert();

  // Show if current page already has a quicklink
  chrome.tabs.getSelected(null, function(tab) {
    chrome.storage.sync.get(null, function(items) {
      for (var item in items) {
        if (items[item] === tab.url) {
          input.setAttribute('placeholder', 'Edit QuickLink for this page');
          currentPageDiv.innerText = 'This page has a QuickLink: ' + item;
          // currentPageDiv.style.display = 'block';
          currentPageDiv.style.visibility = 'visibile';
          pageHasLink = item;
          break;
        }
      }
      // put this line here so that it comes after:  pageHasLink = item
      createViewList(ul, viewDiv, pageHasLink);
    });
  });

  // View Button
  viewButton.addEventListener('click', function() {
    if (ul.style.display === 'none') ul.style.display = 'initial';
    else ul.style.display = 'none';
  });


  // Input gains focus, get rid of red border if save was hit when input empty
  input.addEventListener('focus', function() {
    input.style.borderColor = 'initial';
  });

  // Save Button
  saveButton.addEventListener('click', function() {
    var quickLink = input.value.trim();
    if (!quickLink.length) {
      input.style.borderColor = 'red';
      return;
    }
    // make sure this quicklink doesn't already exist
    chrome.storage.sync.get(null, function(items) {
      for (var item in items) {
        if (input.value === item) {
          input.style.borderColor = 'red';
          return;
        }
      }
      // save this quicklink
      chrome.tabs.getSelected(null, function(tab) {
        if (pageHasLink) {
          chrome.storage.sync.remove(pageHasLink, function() {
            saveLink(quickLink, tab.url, input, saved);
          });
        } else saveLink(quickLink, tab.url, input, saved);
      });
    });
  });
});


function saveLink(quickLink, url, input, saved) {
  chrome.storage.sync.set({[quickLink]: url}, function(linkObj) {
    saved.classList.add('saved-animation');
    setTimeout(function() {
      input.value = '';
      document.getElementById('currentPageLink').innerText = 'This page has a QuickLink: ' + quickLink;
    }, 1000);
    setTimeout(function() { saved.style.display = 'none'; }, 1600);
    // add new link to the ul
  });
}

function createViewList(ul, viewDiv, pageHasLink) {
  var li, deleteOne, text;
  ul.style.display = 'none';
  ul.style.listStyleType = 'none';
  ul.style.paddingLeft = 0;
  chrome.storage.sync.get(null, function(items) {
    for (var item in items) {
      li = document.createElement('li');
      li.setAttribute('id', item);
      deleteOne = document.createElement('button');
      deleteOne.innerText = 'x';
      deleteOne.addEventListener('click', function(event) {
        chrome.storage.sync.remove(event.path[0].parentNode.getAttribute('id'), function() {
          if (pageHasLink) document.getElementById('currentPageLink').style.visilibity = 'hidden';//display = 'none';
          ul.removeChild(event.path[0].parentNode);
        });
      });
      text = document.createElement('div');
      text.setAttribute('href', items[item]);
      text.addEventListener('click', function(event) {
        chrome.tabs.update({'url': event.path[1].getAttribute('href')});
      });
      text.classList.add('list-item-div');
      text.innerHTML = '<span class="link">' + item + '</span><br><span class="url">' + items[item] + '</span>';
      li.appendChild(text);
      li.appendChild(deleteOne);
      ul.appendChild(li);
    }
    // if current page is already linked, put at top of quicklink list
    if (pageHasLink) ul.insertBefore(ul.querySelector('#'+pageHasLink), ul.firstChild);
    viewDiv.appendChild(ul);
  });
}

function createSavedAlert() {
  var savedAlert = document.createElement('div');
  savedAlert.classList.add('saved-alert');
  savedAlert.setAttribute('id', 'saved');
  savedAlert.innerText = 'Saved';
  document.body.appendChild(savedAlert);
  return savedAlert;
}

