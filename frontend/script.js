function getHours() {
    const now = new Date();
    const hoursNow = now.toLocaleString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' });
   
    
    const clock = document.getElementById("clock");
    
    clock.innerHTML = hoursNow;
}

let intervalId = setInterval(getHours, 1000);

getHours();