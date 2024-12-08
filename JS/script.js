var todoList = JSON.parse(localStorage.getItem("todoList")) || [];
var comTodoList = JSON.parse(localStorage.getItem("comTodoList")) || [];


var addTask = document.getElementById("addTask");
var taskInput = document.getElementById("taskInput");
var taskList = document.getElementById("taskList");
var comTaskList = document.getElementById("comTaskList");
var taskDeadline = document.getElementById("taskDeadline");
var taskPriority = document.getElementById("priority");

var sortListUp = document.getElementById("sortListUp");
var sortListDown = document.getElementById("sortListDown");

addTask.addEventListener('click', add);
sortListUp.addEventListener('click', () => priSort("up"));
sortListDown.addEventListener('click', () => priSort("down"));

taskInput.addEventListener('keypress', (event) => event.key == 'Enter' && add());

update();
updateComplete();

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
                priority:taskPriority.value
               };

    todoList.push(task);
    taskInput.value = '';
    taskDeadline.value = '';
    taskPriority.value = '';
    
    save();
    update();
    updateComplete();
}

function remove(index) {
    todoList.splice(index, 1)
    save();
    update();
    updateComplete();
}

function complete(index) {

    var completeTask = todoList.splice(index, 1)[0];
    comTodoList.unshift(completeTask);

    save();
    update();
    updateComplete();
}

function undo(index) {
    var undoComplete = comTodoList.splice(index,1)[0];
    todoList.push(undoComplete);

    save();
    update();
    updateComplete();
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
        li.style.borderColor = "green";
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
    taskList.innerHTML = '';

    todoList.forEach((task, index) => {

        createTask(task, index, false);
    });


}

function updateComplete() {

    comTaskList.innerHTML = '';

    if (comTodoList.length === 0) {
        comTaskList.innerHTML = 'No tasks completed... yet';
    }

    comTodoList.forEach((task,index) => {
        createTask(task, index, true);
    });

    
}

function priSort(order) {
    taskList.innerHTML = '';
    var priorityList = ["urgent", "high", "medium", "low"];

    if (order === "up") {
    priorityList.forEach((thisPriority) => {
        todoList.forEach((task, index) =>{
            if(task.priority == thisPriority) {
                createTask(task, index, false);
                 }
                });
         });
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
     }
}

function dateSort() {
    taskList.innerHTML = '';
    todoList.forEach((task, index) => {
        currentDate = ""
    });
}


function save() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
    localStorage.setItem("comTodoList", JSON.stringify(comTodoList));

}