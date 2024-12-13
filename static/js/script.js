// todoList and comTodoList retrieved from todoList and comTodoList otherwise an empty array.
var todoList = JSON.parse(localStorage.getItem("todoList")) || [];
var comTodoList = JSON.parse(localStorage.getItem("comTodoList")) || [];


// All var initialisation for all elements used in my html
var addTask = document.getElementById("addTask");
var taskInput = document.getElementById("taskInput");
var taskList = document.getElementById("taskList");
var comTaskList = document.getElementById("comTaskList");
var taskDeadline = document.getElementById("taskDeadline");
var taskPriority = document.getElementById("priority");

// Sort and filter functionality buttons
var filterButton = document.getElementById("filterButton");
var sortListUp = document.getElementById("sortListUp");
var sortListDown = document.getElementById("sortListDown");
var saveListButton = document.getElementById("saveListButton");

//Even listeners for functions attached to button clicks.
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
        // Show success message
        alert(data.message || 'List saved successfully!');
        // Resets the local storage in order to avoid repeating tasks
        todoList = [];
        comTodoList = [];
    })
        // Show error message on failure
    .catch(() => alert('Error saving list.'));
});

// Function to loadTasks on document load up.
function loadTasks() {
    fetch('/load_tasks')
        .then(response => response.json())

        // catches any errors in data
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

//Add task function
function add() {

    //Checks if taskInput is empty, displays message if empty.
    if (taskInput.value == "") {
        alert("You must insert a task!")
        return;
    }

    // Priority must be set aswell.
    else if (taskPriority.value == "" || taskPriority.value == "Priority") {
        alert("You must have a priority level!")
        return;
    }

    //Creates task object with info, deadline, priority and completed state.
    var task = {
                info: taskInput.value,
                deadline: taskDeadline.value,
                priority:taskPriority.value,
                completed: false
               };

    //pushes to todoList localstorage
    todoList.push(task);

    //Resets all input values
    taskInput.value = '';
    taskDeadline.value = '';
    taskPriority.value = '';

    save();
    update();

}

// Function to remove a task entirely.
function remove(index) {
    todoList.splice(index, 1)
    update();
}

// Function to mark a task as completed, essentially changing state of completed.
function complete(index) {

    var completeTask = todoList.splice(index, 1)[0];
    completeTask.completed = true;
    comTodoList.unshift(completeTask);

    save();
    update();

}

// Undo function for completed task in completed list. Changes completed state.
function undo(index) {
    var undoComplete = comTodoList.splice(index,1)[0];
    undoComplete.completed = false;
    todoList.push(undoComplete);

    update();
}

// Create Task Function, takes parameters of task object, index and complete state.
function createTask(task, index, taskComplete) {

    // Creates li with class and task info
    var li = document.createElement("li");
    li.classList.add("task");
    li.textContent = task.info;

    // Created r-container for buttons for each list (complete, delete, undo)
    var r_container = document.createElement("div");
    r_container.classList.add("r-container");


    if (taskComplete == false) {

        // If deadline is set (optional) it will set a span on the li with the deadline date.
        if (task.deadline) {
            var deadline = document.createElement("span");
            deadline.classList.add("deadline-tag");
            deadline.textContent = task.deadline;
            r_container.appendChild(deadline);
            }

            // Creates span for priority tag.
            var priority = document.createElement("span");
            priority.classList.add("priority-tag", task.priority);
            priority.textContent = task.priority;
            r_container.appendChild(priority);

            // Creates the completed button calling complete() function
            var completeButton = document.createElement("span");
            completeButton.classList.add("complete");
            completeButton.innerHTML = "&#10004;";
            completeButton.addEventListener('click', () => {complete(index);});
            r_container.appendChild(completeButton);

            // Same as completed button but to remove the task. Calls remove()
            var deleteButton = document.createElement("button");
            deleteButton.classList.add("remove");
            deleteButton.innerHTML = "&#10006;";
            deleteButton.addEventListener('click', () => {remove(index);});
            r_container.appendChild(deleteButton);

            // Appends task to ul in mainpage taskList
            li.appendChild(r_container);
            taskList.appendChild(li);

    }

    // Checks if a task is completed.
    else if (taskComplete == true) {
        li.classList.add("task");
        li.style.border = "2px solid green";
        li.style.color = "lightgrey";
        li.style.textDecoration = "line-through";

        // Creates undo button. Calls undo()
        var undoButton = document.createElement("button");
        undoButton.classList.add("undo");
        undoButton.innerHTML = "undo";
        undoButton.addEventListener('click', () => {undo(index);});
        r_container.appendChild(undoButton);

        // Appends to comTaskList instead, seperate from taskList.
        li.appendChild(r_container);
        comTaskList.appendChild(li);
    }
}

// Update function to iterate through current localstorage todoList and comTodoList to show on taskList and comTasklist
function update() {
    clear();

    // for each todoList index, creates the task.
    todoList.forEach((task, index) => {
        createTask(task, index, false);
    });

    comTaskList.innerHTML = '';

    //for each comTodoList index, creates a complete task.
    if (comTodoList.length === 0) {
        comTaskList.innerHTML = 'No tasks completed... yet';
    }

    comTodoList.forEach((task,index) => {
        createTask(task, index, true);
    });


}

// Sort functionality for sorting out task list from highest priority state to lowest and vice versa
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

    // Sorts in descending order
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

// Filter function to change filter state from no filter, dated tasks and non-dated tasks.
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
    // currentfilter state change to dated tasks
    else if (currentFilter == "Filter: Dated Tasks") {
        filterButton.textContent = "Filter: Non-Dated Tasks";
        todoList.forEach((task,index) => {
            if(!task.deadline){
                createTask(task, index, false);
            }
        });

    }
    // currentfilter state to non dated tasks.
    else if (currentFilter == "Filter: Non-Dated Tasks") {
        filterButton.textContent = "Filter: None";
        update();
    }
}


//Clears all in taskList.
function clear() {
    taskList.innerHTML = '';
}

//Save function called to save current list to localstorage for any restarts client-side.
function save() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
    localStorage.setItem("comTodoList", JSON.stringify(comTodoList));

}