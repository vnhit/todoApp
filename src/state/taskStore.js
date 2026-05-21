const STORAGE_KEY = 'my_personal_todo_tasks';

const loadTasksFromStore = () =>{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTasks;   
};

export let mockTasks = loadTasksFromStore();

const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
}

export const addTask = (newtask) => {
    mockTasks.push(newtask);
    saveTasks();
};

export const deleteTask = (taskId) => {
    mockTasks = mockTasks.filter(t => t.id !== taskId);
    saveTasks();
};