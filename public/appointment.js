const date = document.querySelector('#date')
const time = document.querySelector('#time')
const submit = document.querySelector('.submit')


submit.addEventListener('click', (event)=>{
    console.log(date.value,'next', time.value)
    console.log(typeof date.value)
})