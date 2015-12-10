// on save need to add new quicklink to top of view list

document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('save');
  var input = document.getElementById('codeInput');
  var viewButton = document.getElementById('view');
  var viewDiv = document.getElementById('show');
  var currentPageDiv = document.getElementById('currentPageLink');
  var pageHasLink = { link: false };
  var ul = document.createElement('ul');
  var saved = createAlert('green', 'Saved');
  var noInputAlert = createAlert('red', 'No Input');
  var alreadyExistsAlert = createAlert('red', 'Already Exists');

  // Show if current page already has a quicklink
  chrome.tabs.getSelected(null, function(tab) {
    chrome.storage.sync.get(null, function(items) {
      for (var item in items) {
        if (items[item] === tab.url) {
          input.setAttribute('placeholder', 'Edit QuickLink for this page');
          currentPageDiv.innerText = 'This page has a QuickLink: ' + item;
          // currentPageDiv.style.display = 'block';
          currentPageDiv.style.visibility = 'visibile';
          pageHasLink.link = item;
          break;
        }
      }
      // put this line here so that it comes after:  pageHasLink.link = item
      createViewList(ul, viewDiv, pageHasLink);
    });
  });

  // View Button
  viewButton.addEventListener('click', function() {
    if (ul.style.display === 'none') ul.style.display = 'initial';
    else ul.style.display = 'none';
  });


  // Save Button
  document.getElementsByTagName('form')[0].addEventListener('submit', function(event) {
    event.preventDefault();
    var quickLink = input.value.trim();
    // if no input
    if (!quickLink.length) {
      noInputAlert.classList.add('bad-input-animation');
      setTimeout(function() {
        noInputAlert.classList.add('display-none');
        noInputAlert.classList.remove('bad-input-animation');
      }, 1600);
      return;
    }
    // make sure this quicklink doesn't already exist
    chrome.storage.sync.get(null, function(items) {
      for (var item in items) {
        if (input.value === item) {
          alreadyExistsAlert.classList.add('bad-input-animation');
          setTimeout(function() {
            alreadyExistsAlert.classList.add('display-none');
            alreadyExistsAlert.classList.remove('bad-input-animation');
          }, 1600);
          return;
        }
      }
      // save this quicklink
      chrome.tabs.getSelected(null, function(tab) {
        // if editing existing page link
        if (pageHasLink.link) {
          chrome.storage.sync.remove(pageHasLink.link, function() {
            saveLink(quickLink, tab.url, input, saved);
            ul.removeChild(ul.firstChild);
            var li = createListItemForLinkList(quickLink, ul, tab.url, pageHasLink);
            ul.insertBefore(li, ul.firstChild);
          });
        } else saveLink(quickLink, tab.url, input, saved);
      });
    });
  });
});

function createListItemForLinkList(quickLink, list, url, pageHasLink) {
  var li = document.createElement('li');
  console.log('link', quickLink);
  li.setAttribute('id', quickLink);
  var deleteButton = createDeleteButtonForLinkListItem(quickLink, list, pageHasLink);
  var text = createTextForLinkListItem(quickLink, url);
  li.appendChild(text);
  li.appendChild(deleteButton);
  return li;
}

function createDeleteButtonForLinkListItem(quickLink, list, pageHasLink) {
  var deleteOne = document.createElement('button');
  deleteOne.innerText = 'x';
  deleteOne.addEventListener('click', function(event) {
    chrome.storage.sync.remove(event.path[0].parentNode.getAttribute('id'), function() {
      if (quickLink) document.getElementById('currentPageLink').style.visibility = 'hidden';//display = 'none';
      list.removeChild(event.path[0].parentNode);
      pageHasLink.link = false;
    });
  });
  return deleteOne;
}

// i need to quicklink key, i need the url
function createTextForLinkListItem(quickLink, url) {
  text = document.createElement('div');
  text.setAttribute('href', url);
  text.addEventListener('click', function(event) {
    chrome.tabs.update({'url': event.path[1].getAttribute('href')});
  });
  text.classList.add('list-item-div');
  text.innerHTML = '<span class="link">' + quickLink + '</span><br><span class="url">' + url + '</span>';
  return text;
}


function saveLink(quickLink, url, input, saved) {
  chrome.storage.sync.set({[quickLink]: url}, function(linkObj) {
    saved.classList.add('saved-animation');
    setTimeout(function() { window.close(); }, 1100);
  });
}

function createViewList(ul, viewDiv, pageHasLink) {
  var li;
  ul.style.display = 'none';
  ul.style.listStyleType = 'none';
  ul.style.paddingLeft = 0;
  chrome.storage.sync.get(null, function(items) {
    for (var item in items) {
      li = createListItemForLinkList(item, ul, items[item], pageHasLink);
      ul.appendChild(li);
    }
    // if current page is already linked, put at top of quicklink list
    if (pageHasLink.link) ul.insertBefore(ul.querySelector('#'+pageHasLink.link), ul.firstChild);
    viewDiv.appendChild(ul);
  });
}

function createAlert(color, text) {
  var alert = document.createElement('div');
  alert.classList.add('alert');
  alert.style.backgroundColor = color;
  alert.innerText = text;
  document.body.appendChild(alert);
  return alert;
}

