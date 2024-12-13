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


taskInput.addEventListener('keypress', (event) => event.key == 'Enter' && add());
filterButton.addEventListener('click', () => filterDate(filterButton.textContent));
update();


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

}

function remove(index) {
    todoList.splice(index, 1)
    save();
    update();
}

function complete(index) {

    var completeTask = todoList.splice(index, 1)[0];
    comTodoList.unshift(completeTask);

    save();
    update();

}

function undo(index) {
    var undoComplete = comTodoList.splice(index,1)[0];
    todoList.push(undoComplete);

    save();
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

var currentFilter = "none";
if (currentFilter == "none") {
    update();    
}
else if (currentFilter == "dated") {
    filterDate();
}

else if (currentFilter == "non-dated") {
    filterNonDate();
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