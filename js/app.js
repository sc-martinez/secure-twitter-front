var MessageApp = window.MessageApp || {};

(function messageScopeWrapper($) {
  const loginSelector = document.querySelector('#login')
  const registerSelector = document.querySelector('#register')
  const logoutSelector = document.querySelector('#logout')
  const chatHeader = document.querySelector('.chat-header')
  const chatMessages = document.querySelector('.chat-messages')
  const chatInputForm = document.querySelector('.chat-input-form')
  const chatInput = document.querySelector('.chat-input')
  const createChatMessageElement = (message) => `
    <div class="message ${message.sender === MessageApp.cognitoUser.username ? 'blue-bg' : 'gray-bg'}">
      <div class="message-sender">${message.sender}</div>
      <div class="message-text">${message.comment}</div>
    </div>
  `
  var messages = JSON.parse(localStorage.getItem('messages')) || [];
  var authToken;

    function publishMessage(message){
      chatMessages.innerHTML += createChatMessageElement(message)
    }

    function loadMessages(){
      //chatHeader.innerHTML = 'Loading Messages ......';
      $.ajax({
        method: 'GET',
        url: _config.api.invokeUrl + '/thread',
        crossDomain: true,
        headers: {
            Authorization: authToken
        },
        contentType: 'application/json',
        success: (result) => {
          chatHeader.innerHTML = '';
          messages = result;
          localStorage.setItem('messages', JSON.stringify(messages))
          chatInput.disabled = false;
          chatMessages.innerHTML = "";
          if(messages.length > 0){
            messages[0].messages.forEach(publishMessage);
          }
          /*  Scroll to bottom of chat messages */
          chatMessages.scrollTop = chatMessages.scrollHeight
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error loading mesagges: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
      });
      setTimeout(loadMessages,1500);
    }
  
  

  function evalueateSession(){
    MessageApp.authToken.then(function setAuthToken(token) {
        if (token) {
            chatInput.disabled = true;
            authToken = token;
            loginSelector.hidden = true;
            registerSelector.hidden = true;
            logoutSelector.hidden = false;
            loadMessages();
        } else {
            chatInput.disabled = true;
            loginSelector.hidden = false;
            registerSelector.hidden = false;
            logoutSelector.hidden = true;
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    localStorage.clear();
  }
  evalueateSession();
  
  

 

  MessageApp.messageSender = {};


  loginSelector.onclick = () => {
    window.location.href = '/signin.html';
  }
  registerSelector.onclick = () => {
    window.location.href = '/register.html';
  }

  

  const sendMessage = (e) => {
    if(!authToken){
      alert('Session has not been stablished, please log in or register')
    }
    e.preventDefault()
    if(messages.length == 0){
      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/thread/comment',
        crossDomain: true,
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            comment: chatInput.value,
            owner: MessageApp.cognitoUser.username
        }),
        contentType: 'application/json',
        success: function(response){
          chatInputForm.reset()
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
      });
    }
    else{
      $.ajax({
        method: 'POST',
        crossDomain: true,
        url: _config.api.invokeUrl + '/thread/comment/'+messages[0].id,
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            comment: chatInput.value,
            sender: MessageApp.cognitoUser.username
        }),
        contentType: 'application/json',
        success: function(response){
          chatInputForm.reset()
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
      });
    }

    
  }

  chatInputForm.addEventListener('submit', sendMessage)

  

  // Register click handler for #request button
  $(function onDocReady() {
    $('#logout').click(()=>{
       window.location.reload();
    });
  });

}(jQuery));
