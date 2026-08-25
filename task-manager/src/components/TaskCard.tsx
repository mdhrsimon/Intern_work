type TaskCardProps= {
    title: string;
    description: string;
    completed:boolean;
    onComplete: (id:number) => void;
};
const TaskCard = ({title,description,completed,onComplete}:TaskCardProps)=>{
    return(
        <div>
            <h2>{title}</h2>
            <p>{description}</p>
            <p>Status:{completed?"Completed":"Pending"}
            </p>
            <button onClick={onComplete}>
                {completed?"Completes":"Complete"}
            </button>
        </div>
    );
};
export default TaskCard;