import TaskCard from"./components/TaskCard";
import {useState} from 'react';
import type {Task} from "./types/task";

const App = ()=>{
  const[tasks, setTasks]=useState<Task[]>([
    {
      id:1,
      title:"Learn React",
      description:"Study React components and props",
      completed:false
    },
    {
      id:2,
      title:"Learn TypeScript",
      description:"Practice types and functions",
      completed:false

    }
  ]);

  const completeTask= (id:number)=>{
    console.log("Completed Task",id)

  };
  return(
    <div>
      <h1>Task Manager</h1>
      {tasks.map((task)=>(
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          completed={task.completed}
          onComplete={completeTask}
                  
        />   

      ))}
      
        
        
          
    </div>
  );
};
export default App;