var $chatFeed = $('.chat');

var displayMessages = function(data) {
  console.log(data);
  var messages = data.results;
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    var $date = ($.format.date(message.createdAt, 'MMM d h:mm p'));
    var $newMessage = $('<div class="message"></div>');
    $newMessage.html(
      '<div class="message-date">' + $date +
      '</div><div class="username">' + _.escape(message.username) +
      '</div><div class="message-text">' + _.escape(message.text) + '</div>');
    $newMessage.prependTo($chatFeed);
  }
};

var errorHandler = function() {
  console.error('error');
};

// ajax get all check on messages
var getMessages = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    success: displayMessages,
    error: errorHandler
  });
};

getMessages();
