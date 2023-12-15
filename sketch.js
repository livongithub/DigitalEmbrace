let myBlurb = document.getElementById('blurb')
let myAbout = document.getElementById('about')

let displayOfBlurb = false



myAbout.addEventListener('click', ()=>{
    displayOfBlurb =! displayOfBlurb
    console.log(displayOfBlurb)
    if(displayOfBlurb == true){
        myBlurb.style.display = 'block' 
    } else  if (displayOfBlurb == false){
        myBlurb.style.display = 'none' 
    }
})


// myAbout.addEventListener('mouseleave', ()=>{
//     myBlurb.style.display = 'none'
// })
