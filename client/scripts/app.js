// Get username
var userName = window.prompt("Please enter your username");

var $chatFeed = $('.chat');
var recentMessageId;

var displayMessages = function(data) {
  console.log(data);
  var messages = data.results;
  var message;
  var i;

  // Eliminate previously displayed messages
  if (recentMessageId !== undefined) {
    for (i = 0; i < messages.length; i++) {
      if (messages[i].objectId === recentMessageId) {
        messages.splice(0, i+1);
        break;
      }
    }
  }

  // add messages to document in reverse chronological order
  for (i = 0; i < messages.length; i++) {
    message = messages[i];
    var $date = ($.format.date(message.createdAt, 'MMM d h:mm:ss p'));  // display in local time
    var $newMessage = $('<div class="message"></div>');
    $newMessage.html(
      '<div class="message-date">' + $date +
      '</div><div class="username">' + _.escape(message.username) +
      '</div><div class="message-text">' + _.escape(message.text) + '</div>');
    $newMessage.prependTo($chatFeed);
    recentMessageId = message.objectId;
  }
};

var errorHandler = function() {
  console.error('error');
};

// ajax fetch chat messages
var getMessages = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    success: displayMessages,
    error: errorHandler
  });
};

// Initialize feed and fetch messages every 1s
getMessages();
setInterval(getMessages, 1000);

// Posting message
$('.submit-btn').on('click', function(event){
  event.preventDefault();
  var $textInput = $(this).closest('form').find('textarea');
  var message = {
    username: userName,
    text: $textInput.val(),
    roomname: 'default'
  };
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/JSON',
    success: function() {
      console.log('message sent');
    },
    error: errorHandler
  });
  // immediately updates feed upon submit click
  getMessages();
});
