var todoList = JSON.parse(localStorage.getItem("todoList")) || [];
var comTodoList = JSON.parse(localStorage.getItem("comTodoList")) || [];



var addTask = document.getElementById("addTask");
var taskInput = document.getElementById("taskInput");
var taskList = document.getElementById("taskList");
var comTaskList = document.getElementById("comTaskList");
var taskDeadline = document.getElementById("taskDeadline");
var taskPriority = document.getElementById("priority");

var filterButton = document.getElementById("filterButton");
var sortListUp = document.getElementById("sortListUp");
var sortListDown = document.getElementById("sortListDown");
var saveListButton = document.getElementById("saveListButton");

addTask.addEventListener('click', add);
sortListUp.addEventListener('click', () => priSort("up"));
sortListDown.addEventListener('click', () => priSort("down"));
filterButton.addEventListener( 'click', () => filterDate(filterButton.textContent));

//Save List Button in order to save website's localstorage to a server database.
saveListButton.addEventListener('click', () => {
    // Prepares the todoList to save
    var todoListSave = todoList.map(task => ({
        info: task.info,
        deadline: task.deadline,
        priority: task.priority,
        completed: task.completed
    }));

    // Prepares the Complete to-do list to save
    var comTodoListSave = comTodoList.map(task => ({
        info: task.info,
        deadline: task.deadline,
        priority: task.priority,
        completed: task.completed
    }));

    // Send data to the server using json format
    fetch('/save_lists', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            todoList: todoListSave,
            comTodoList: comTodoListSave
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'List saved successfully!');  // Show success message
        // Resets the local storage in order to avoid repeating tasks
        todoList = [];
        comTodoList = [];
    })
    .catch(() => alert('Error saving list.'));  // Show error message on failure
});

function loadTasks() {
    fetch('/load_tasks')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Resets current localstorage lists
                localStorage.removeItem("todoList")
                localStorage.removeItem("comTodoList")

                // Create and store active tasks
                todoList = data.activeList.map(task => ({
                    info: task.info,
                    deadline: task.deadline,
                    priority: task.priority,
                    completed: false
                }));
                // Store active tasks in localStorage
                localStorage.setItem("todoList", JSON.stringify(todoList));

                // Create and store completed tasks
                comTodoList = data.completeList.map(task => ({
                    info: task.info,
                    deadline: task.deadline,
                    priority: task.priority,
                    completed: true
                }));
                // Store completed tasks in localStorage
                localStorage.setItem("comTodoList", JSON.stringify(comTodoList));

                // Update UI to show loaded tasks
                update();
            }
        })
        .catch(error => console.error('Error loading tasks:', error));
}

// Call loadTasks when the main page is loaded
document.addEventListener('DOMContentLoaded', loadTasks);


function add() {

    if (taskInput.value == "") {
        alert("You must insert a task!")
        return;
    }

    else if (taskPriority.value == "" || taskPriority.value == "Priority") {
        alert("You must have a priority level!")
        return;
    }
    var task = {
                info: taskInput.value,
                deadline: taskDeadline.value,
                priority:taskPriority.value,
                completed: false
               };

    todoList.push(task);

    taskInput.value = '';
    taskDeadline.value = '';
    taskPriority.value = '';

    save();
    update();

}

function remove(index) {
    todoList.splice(index, 1)
    update();
}

function complete(index) {

    var completeTask = todoList.splice(index, 1)[0];
    completeTask.completed = true;
    comTodoList.unshift(completeTask);

    save();
    update();

}

function undo(index) {
    var undoComplete = comTodoList.splice(index,1)[0];
    undoComplete.completed = false;
    todoList.push(undoComplete);

    update();
}

function createTask(task, index, taskComplete) {

    var li = document.createElement("li");
    li.classList.add("task");
    li.textContent = task.info;

    var r_container = document.createElement("div");
    r_container.classList.add("r-container");

    if (taskComplete == false) {

        if (task.deadline) {
            var deadline = document.createElement("span");
            deadline.classList.add("deadline-tag");
            deadline.textContent = task.deadline;
            r_container.appendChild(deadline);
            }

            var priority = document.createElement("span");
            priority.classList.add("priority-tag", task.priority);
            priority.textContent = task.priority;
            r_container.appendChild(priority);

            var completeButton = document.createElement("span");
            completeButton.classList.add("complete");
            completeButton.innerHTML = "&#10004;";
            completeButton.addEventListener('click', () => {complete(index);});
            r_container.appendChild(completeButton);

            var deleteButton = document.createElement("button");
            deleteButton.classList.add("remove");
            deleteButton.innerHTML = "&#10006;";
            deleteButton.addEventListener('click', () => {remove(index);});
            r_container.appendChild(deleteButton);

            li.appendChild(r_container);
            taskList.appendChild(li);

    }

    else if (taskComplete == true) {
        li.classList.add("task");
        li.style.border = "2px solid green";
        li.style.color = "lightgrey";
        li.style.textDecoration = "line-through";

        var undoButton = document.createElement("button");
        undoButton.classList.add("undo");
        undoButton.innerHTML = "undo";
        undoButton.addEventListener('click', () => {undo(index);});
        r_container.appendChild(undoButton);

        li.appendChild(r_container);
        comTaskList.appendChild(li);
    }
}

function update() {
    clear();

    todoList.forEach((task, index) => {
        createTask(task, index, false);
    });

    comTaskList.innerHTML = '';

    if (comTodoList.length === 0) {
        comTaskList.innerHTML = 'No tasks completed... yet';
    }

    comTodoList.forEach((task,index) => {
        createTask(task, index, true);
    });


}


function priSort(order) {
    clear();
    var priorityList = ["urgent", "high", "medium", "low"];

    if (order === "up") {
    priorityList.forEach((thisPriority) => {
        todoList.forEach((task, index) =>{
            if(task.priority == thisPriority) {
                createTask(task, index, false);
                 }
                });
         });
         save();
    }

    else if (order === "down") {
        var revPList = priorityList.reverse();

        revPList.forEach((thisPriority) => {
        todoList.forEach((task, index) =>{
            if(task.priority == thisPriority) {
                createTask(task, index, false);
                     }
                    });
             });
             save();
     }
}


function filterDate(currentFilter) {
    clear();
    if (currentFilter == "Filter: None") {
        filterButton.textContent = "Filter: Dated Tasks";

        todoList.forEach((task,index) => {
            if(task.deadline){
                createTask(task, index, false);
            }
        });

    }

    else if (currentFilter == "Filter: Dated Tasks") {
        filterButton.textContent = "Filter: Non-Dated Tasks";
        todoList.forEach((task,index) => {
            if(!task.deadline){
                createTask(task, index, false);
            }
        });

    }

    else if (currentFilter == "Filter: Non-Dated Tasks") {
        filterButton.textContent = "Filter: None";
        update();
    }
}





function clear() {
    taskList.innerHTML = '';
}


function save() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
    localStorage.setItem("comTodoList", JSON.stringify(comTodoList));

}