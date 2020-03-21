const socket = io()


//Elements
const $messageForm = document.querySelector('#sendMessage')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#sendLocation')
const $messageDiv = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messageDiv.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messageDiv.offsetHeight

    // Height of messages container
    const containerHeight = $messageDiv.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messageDiv.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messageDiv.scrollTop = $messageDiv.scrollHeight
    }
}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    $messageFormInput.focus()

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(callback)=>{
        console.log('Sent!',callback)
        $messageFormButton.removeAttribute('disabled')
    })
    $messageFormInput.value = ''

})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return console.log('Your browser does not support geolocation')
    }

    $locationButton.setAttribute('disabled','disabled');


    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(message)=>{
            console.log('Location sent!',message)
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.on('locationMessage',(LocationMessage)=>{
    const html = Mustache.render(locationTemplate,{
        username: LocationMessage.username,
        LocationMessage: LocationMessage.url,
        createdAt: moment(LocationMessage.createdAt).format('h:mm a')
    })
    $messageDiv.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messageDiv.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})