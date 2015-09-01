// Get username
var userName = window.prompt("Please enter your username");

var $chatFeed = $('.chat');
var recentMessageId;
var rooms = [];
var selectedRoom = 'All';
var friends = [];

// checks for new rooms, appends new rooms to html
var updateRooms = function(room) {
  if (rooms.indexOf(room) < 0) {
    rooms.push(room);
    $('.room-menu').append($('<option>', {
      value: _.escape(room),
      text: '' + _.escape(room)
    }));
  }
};

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
    var roomName = message.roomname;

    roomName = (roomName === undefined || roomName === null || roomName.trim() === '') ?
                'default' :
                roomName.trim();

    updateRooms(roomName);

    var $date = ($.format.date(message.createdAt, 'MMM d h:mm:ss p'));  // display in local time

    var $newMessage = $('<div class="message" data-roomname="' +
                        _.escape(roomName) + '"></div>');
    $newMessage.html(
      '<div class="message-date">' + $date +
      '</div><div class="username"><a href="#" class="username-link">' +
      _.escape(message.username) + '</a></div><div class="message-text">' +
      _.escape(message.text) + '</div>');
    // if (friends.indexOf($newMessage.find('.username-link').text()) >= 0) {
    //   $newMessage.addClass('friend');
    // }
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
    roomname: selectedRoom
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

// filter messages by room
var filterMessagesByRoom = function(roomName) {
  $('.message').each(function(){
    if ((roomName === 'All') || ($(this).data('roomname') === roomName)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
};

$('.room-menu').change(function() {
  selectedRoom = $(this).val();

  if (selectedRoom === 'add-room') {
    selectedRoom = window.prompt("Please enter new room name");
    updateRooms(selectedRoom);
    $('.rooms select').val('' + _.escape(selectedRoom));
  }

  filterMessagesByRoom(_.escape(selectedRoom));
});

var highlightFriendsMessages = function() {
  $('.message').each(function(){
    if (friends.indexOf($(this).find('.username-link').text()) >= 0) {
      $(this).addClass('friend');
    } else {
      $(this).removeClass('friend');
    }
  });
};

$(document).on('click', '.username-link', function(event) {
  event.preventDefault();
  var newFriend = $(this).text();
  if (friends.indexOf(newFriend) < 0) {
    friends.push(newFriend);
  } else {
    friends.splice(friends.indexOf(newFriend), 1);
  }
  highlightFriendsMessages();
});
