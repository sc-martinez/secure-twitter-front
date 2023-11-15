var MessageApp = window.MessageApp || {};

(function messageScopeWrapper($) {
  const loginSelector = document.querySelector('#login')
  const registerSelector = document.querySelector('#register')
  const logoutSelector = document.querySelector('#logout')
  const chatHeader = document.querySelector('.chat-header')
  const chatMessages = document.querySelector('.chat-messages')
  const chatInputForm = document.querySelector('.chat-input-form')
  const chatInput = document.querySelector('.chat-input')

  const messages = JSON.parse(localStorage.getItem('messages')) || [];
  var authToken;

    function loadMessages(){
      $.ajax({
        method: 'GET',
        url: _config.api.invokeUrl + '/thread',
        headers: {
            Authorization: authToken
        },
        contentType: 'application/json',
        success: (result) => {
          console.log(result);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error loading mesagges: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
      });
    }

  function evalueateSession(){
    MessageApp.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            chatInput.disabled = false;
            loginSelector.hidden = true;
            logoutSelector.hidden = false;
            loadMessages();
        } else {
            chatInput.disabled = true;
            loginSelector.hidden = false;
            logoutSelector.hidden = true;
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    localStorage.clear();
  }
  evalueateSession();
  
  

  const createChatMessageElement = (message) => `
    <div class="message ${message.sender === 'John' ? 'blue-bg' : 'gray-bg'}">
      <div class="message-sender">${message.sender}</div>
      <div class="message-text">${message.text}</div>
      <div class="message-timestamp">${message.timestamp}</div>
    </div>
  `

  window.onload = () => {
    messages.forEach((message) => {
      chatMessages.innerHTML += createChatMessageElement(message)
    })
  }

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

    const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    const message = {
      sender: messageSender,
      text: chatInput.value,
      timestamp,
    }

    /* Save message to local storage */
    messages.push(message)
    localStorage.setItem('messages', JSON.stringify(messages))

    /* Add message to DOM */
    chatMessages.innerHTML += createChatMessageElement(message)

    /* Clear input field */
    chatInputForm.reset()

    /*  Scroll to bottom of chat messages */
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  chatInputForm.addEventListener('submit', sendMessage)

  

  // Register click handler for #request button
  $(function onDocReady() {
    $('#logout').click(()=>{
       window.location.reload();
    });
  });

}(jQuery));
