var todoList = JSON.parse(localStorage.getItem("todoList")) || [];

var addTask = document.getElementById("addTask");
var taskInput = document.getElementById("taskInput");
var taskList = document.getElementById("taskList");
var taskDeadline = document.getElementById("taskDeadline");
var taskPriority = document.getElementById("priority");

addTask.addEventListener('click', add);

taskInput.addEventListener('keypress', (event) => event.key == 'Enter' && add());

update();

function add() {
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

function update() {
    taskList.innerHTML = '';

    todoList.forEach((task, index) => {
        var li = document.createElement("li");

        // var taskInfo = document.createElement("span");
        li.classList.add("task");
        li.textContent = task.info + " Due:" +
                        (task.deadline || " ") + " Priority:" +
                        (task.priority || " ");

        var deleteButton = document.createElement("delbutton");
        deleteButton.classList.add("remove");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click', () => {remove(index);});
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });

}

function save() {
    localStorage.setItem("todoList", JSON.stringify(todoList));

}