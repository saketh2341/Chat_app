const socket =io()
const message=document.querySelector("#message")
const messageformbutton=message.querySelector('button')
const messageforminput=message.querySelector('input')
const sendlocationbutton=document.querySelector("#location")
const messages=document.querySelector("#messages")
const messagetemplate=document.querySelector('#message-template').innerHTML
const locationtemplate=document.querySelector('#location-template').innerHTML
const sidebar=document.querySelector('#sidebar-template').innerHTML

const {username, room } =Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
    const newmessage= messages.lastElementChild 

    const newmessageStyles=getComputedStyle(newmessage)
    const newmessagemargin=parseInt(newmessageStyles.marginBottom)
    const newmessagehieght=newmessage.offsetHeight +newmessagemargin 

    const visiblehieght=messages.offsetHeight
    const containerhieght=messages.scrollHeight

    const scrolloffset=messages.scrollTop + visiblehieght
    if(containerhieght - newmessagehieght <= scrolloffset)
    {
       messages.scrollTop = messages.scrollHeight
    }  
}

socket.on('message',(message)=>{
console.log(message)  

const html=Mustache.render(messagetemplate,{
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a'),
    username:message.username
})
// const html=Mustache.render(messagetemplate)
messages.insertAdjacentHTML('beforeend',html)
autoscroll()

})


document.querySelector('#message').addEventListener('submit',(e) =>{
    e.preventDefault()
    messageformbutton.setAttribute('disabled','disabled')
    

    const message=document.querySelector('input').value
    socket.emit('sendmessage',message, ()=>{
        messageformbutton.removeAttribute('disabled')
        messageforminput.value=''
        messageforminput.focus()
        console.log('message delivered')
    })

})

sendlocationbutton.addEventListener('click', () =>{
    if(!navigator.geolocation){
       return alert('notsupportde')
    }
    navigator.geolocation.getCurrentPosition((position) =>{
        sendlocationbutton.setAttribute('disabled','disabled')
        const longitude=position.coords.longitude
        const latitude=position.coords.latitude
        socket.emit('send location', {latitude:latitude,longitude:longitude},()=>{
            sendlocationbutton.removeAttribute('disabled')
            console.log('location delivered')
        })
    })

})

socket.on("send location", (url) =>{
    const html=Mustache.render(locationtemplate,{
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a'),
        username:url.username
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.emit('join',{username,room},(error) =>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({ room,users}) =>{
   const html=Mustache.render(sidebar,{
       room,
       users
   })
   document.querySelector("#sidebar").innerHTML= html
})