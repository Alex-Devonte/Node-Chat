var socket = io();
var username = prompt('Type in your username for this session: ');
var isTypingNotification = $("#is-typing");
var messageBox = $("#send-message-box");
var messages = $("#messages");

var typing = false;
var timeout = "";

socket.emit('username', username);
//Add each new user to the notifications list
socket.on('is_online', function(username) {
  $('#notifications ul').append($('<li>').html(username));
});

function typingTimeout() {
  typing = false;
  socket.emit('stopped typing');
}

messageBox.on("keypress", () => {
  if (typing == false) {
    typing = true;
    socket.emit("typing");
    timeout = setTimeout(typingTimeout, 1500);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(typingTimeout, 1500);
  }
});

socket.on("typing", (data) => {
  isTypingNotification.html(data.username + " is typing . . .").show();
});

socket.on("stopped typing", (data) => {
    isTypingNotification.html(data.username + " stopped typing . . .").show();
});     

socket.on("chat_message", function(data) {
  data.sender = false;

  if (data.username == username) {
    data.sender = true;
  }

  var outgoingTemplate = '<div class="outgoing-message-container message-container"><p class="username">' + data.username + '</p><div class="outgoing-bubble bubble">' + data.message + '</div>';
  var incomingTemplate = '<div class="incoming-message-container message-container"><p class="username">' + data.username + '</p><div class="incoming-bubble bubble">' + data.message + '</div>';
  
  //Append and apply the appropriate styling depending on who sent the message
  data.sender ? messages.append(outgoingTemplate) : messages.append(incomingTemplate);

  /*Hide the username from subsequent messages if sent from the same user*/
  if ($('.incoming-message-container').next(".incoming-message-container"))
  {
    $(".incoming-message-container").next(".incoming-message-container").find(".username").hide()
  }
  if ($('.outgoing-message-container').next(".outgoing-message-container"))
  {
    $(".outgoing-message-container").next(".outgoing-message-container").find(".username").hide()
  }
});

$('#chat-form').submit(function(e) {
  e.preventDefault();   
  socket.emit('chat_message', {message: messageBox.val(), username: username});
  messageBox.val('');
  return false;
});      