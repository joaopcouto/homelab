  const IP_SERVIDOR = window.location.hostname;

  getTodo();
    
    function getTodo() {
const ul = document.getElementById('lista-tarefas');

    fetch(`http://${IP_SERVIDOR}:3333/todos`)
    .then(res => res.json())
    .then(todos => {
        ul.innerHTML = '';

        todos.forEach(todo => {
            const li = document.createElement('li');
            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'Deletar'
            deleteButton.id = todo.id;
            deleteButton.onclick = deleteTodo;

            li.textContent = todo.title;
            li.id = todo.id;

            if(todo.completed) {
                li.style.textDecoration = 'line-through';
            }

            ul.appendChild(li);
            li.appendChild(deleteButton);
            
        });

    })
    }
    
    async function addTodo() {
        const inputValue = document.getElementById('input-tarefa').value;
        try {
            const response = await fetch(`http://${IP_SERVIDOR}:3333/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title: inputValue})
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const clearInput = document.getElementById('input-tarefa').value = '';
            getTodo();
            console.log('Success:', responseData);
        } catch (e) {
            console.error('Error:', e);
        }
    }

    

    async function checkTodo(event) {

        const target = event.target.tagName;
        
        if (target != 'LI') {
            return
        }

        const id = event.target.getAttribute('id');
        try {
            const response = await fetch(`http://${IP_SERVIDOR}:3333/todos/${id}`, {
                method: 'PATCH', 
                // headers: {
                //     'Content-Type': 'application/json'
                // },
                // body: JSON.stringify({id: id})
            });
            if (!response) {
                throw new Error(`HTTP error!: status: ${response.status}`);
            }
            getTodo();
        } catch (e) {
            console.error('Error:', e);
        }
    }

    async function deleteTodo() {
        const id = event.target.getAttribute('id')

        try {
            const response = await fetch(`http://${IP_SERVIDOR}:3333/todos/${id}`, {
                method: 'DELETE'
            });
            if (!response) {
                throw new Error(`HTTP error!: status ${response.status}`);
            }
            getTodo();
        } catch (e) {
            console.error('Error:', e);
        }
    }