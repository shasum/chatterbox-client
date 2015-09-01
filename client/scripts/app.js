// Initialize all global vars
var $chatFeed         = $('.chat');
var friends           = [];
var rooms             = [];
var selectedRoom      = 'All';
var userName          = window.prompt("Please enter your username");
var recentMessageId;


var errorHandler = function() {
  console.error('error');
};

var getMessages = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    success: displayMessages,
    error: errorHandler
  });
};

var displayMessages = function(data) {
  // initialize local vars
  var messages = data.results.reverse(); // order mesgs from server in reverse chrono
  var message;
  var roomName;
  var i;

  // Disregard previously displayed messages
  if (recentMessageId !== undefined) {
    for (i = 0; i < messages.length; i++) {
      if (messages[i].objectId === recentMessageId) {
        messages.splice(0, i+1);
        break;
      }
    }
  }

  // Add messages to document in reverse chronological order
  for (i = 0; i < messages.length; i++) {
    message = messages[i];
    roomName = message.roomname;

    // cleanup unwanted values in roomName
    roomName = (roomName === undefined || roomName === null || roomName.trim() === '') ?
                'default' :
                roomName.trim();

    updateRooms(roomName);

    // TODO: Display time in local timezone
    var $date = ($.format.date(message.createdAt, 'MMM d h:mm:ss p'));

    // Creating Message DOM element and prepending to feed
    var $newMessage = $('<div class="message" data-roomname="' +
                        _.escape(roomName) + '"></div>');
    $newMessage.html(
      '<div class="message-date">' + $date +
      '</div><div class="username"><a href="#" class="username-link">' +
      _.escape(message.username) + '</a></div><div class="message-text">' +
      _.escape(message.text) + '</div>');

    // Apply special css to friend's messages
    if (friends.indexOf($newMessage.find('.username-link').text()) >= 0) {
      $newMessage.addClass('friend');
    }

    $newMessage.prependTo($chatFeed);

    // Most recent message is tracked globally
    recentMessageId = message.objectId;
  }
};


// Initialize feed and fetch messages every 1s
getMessages();
setInterval(getMessages, 1000);


// Posting a message
$('.submit-btn').on('click', function(event){
  event.preventDefault();  // a jQuery necessity to prevent DOM reload

  var $textInput = $(this).closest('form').find('textarea');

  var message = {
    username: userName,
    text: _.escape($textInput.val()),
    roomname: selectedRoom
  };

  // AJAX Post to Parse server
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

  // immediately updates feed upon submission
  getMessages();

  // clear message input box
  $textInput.val('');
});


// Helper function that updates rooms global array
// as well as appends to DOM selection list
var updateRooms = function(room) {
  if (rooms.indexOf(room) < 0) {
    rooms.push(room);
    $('.room-menu').append($('<option>', {
      value: _.escape(room),
      text: '' + _.escape(room)
    }));
  }
};

// Show/Hide messages based on user selected Room
var filterMessagesByRoom = function(roomName) {
  $('.message').each(function(){
    if ((roomName === 'All') || ($(this).data('roomname') === roomName)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
};


// Listener to add a new room
// or change room
$('.room-menu').change(function() {
  selectedRoom = $(this).val();

  // runs when user selects to create new room
  if (selectedRoom === 'add-room') {
    selectedRoom = window.prompt("Please enter new room name");
    updateRooms(selectedRoom);
    $('.rooms select').val('' + _.escape(selectedRoom));
  }

  // filter displayed messages by selected room
  filterMessagesByRoom(_.escape(selectedRoom));
});


// Apply/Remove special css for messages
// from friends vs rest of the users
var highlightFriendsMessages = function() {
  $('.message').each(function(){
    if (friends.indexOf($(this).find('.username-link').text()) >= 0) {
      $(this).addClass('friend');
    } else {
      $(this).removeClass('friend');
    }
  });
};


// Listener to allow user to add/remove friends
$(document).on('click', '.username-link', function(event) {
  event.preventDefault();  // a jQuery necessity to prevent DOM reload

  var newFriend = $(this).text();

  if (friends.indexOf(newFriend) < 0) {
    friends.push(newFriend);
  } else {
    friends.splice(friends.indexOf(newFriend), 1);
  }

  // Run the highlight method on newly
  // updated friend's list
  highlightFriendsMessages();
});
