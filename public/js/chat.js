//the js file for the same is loaded in index.html page
const socket = io(); // this function will be available from socket.io library 
const $messageForm = document.querySelector("#myForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Query

let { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

$messageForm.addEventListener('submit', (e) => {

    // disable form 
    $messageFormButton.setAttribute('disabled', 'disabled');
    e.preventDefault();
    let message = e.target.elements.message.value;
    $messageFormInput.style.removeProperty('border-color');
    if (message.length == 0) {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.style.borderColor = 'red';
        return console.log("Empty message dude!");
    }

    socket.emit('sendMessage', message, (err) => {

        // enable form 
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (err) {
            return console.log("Oops bad word!", err);
        }
        console.log('Message Delivered!');
    });
})

document.querySelector("#send-location").addEventListener('click', (e) => {

    // console.log('location ticked');
    // disable button
    if (!navigator.geolocation)
        return alert("Location is not supported!");

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(pos => {
        let [latitude, longitude] = [pos.coords.latitude, pos.coords.longitude];
        // console.log(latitude, longitude);
        socket.emit("sendLocation", { latitude, longitude }, (err) => {
            // enable button after event acknowledged
            $sendLocationButton.removeAttribute('disabled');

            if (err) {
                return console.log(err);
            }
            console.log("Location shared!");
        })
    })
})

const autoscroll = () => {
    // get new message
    const $newMessage = $messages.lastElementChild;

    //get height of new element
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    
    // visible height
    const visibleHeight = $messages.offsetHeight; // total visible height 

    //height of message container
    const containerHeight = $messages.scrollHeight; // total height we can scroll throught

    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        // we are at the bottom of the message autoscroll
        $messages.scrollTop = $messages.scrollHeight;    
    }
    
}

socket.on('message', (message) => {

    // render template here after receiving the message
    let html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('ddd h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})



socket.on("locationMessage", (data) => {
    let html = Mustache.render($locationTemplate, {
        username: data.username,
        url: data.url,
        createdAt: moment(data.createdAt).format('ddd h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('welcome', (data) => {
    console.log(data);
})

socket.on("sendLocation", (data) => {
    console.log('Yeah! friend sent a location', data)
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })

    document.querySelector("#sidebar").innerHTML = html;

})