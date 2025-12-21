'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Clock, MapPin, GripVertical, Trash2, Pencil } from 'lucide-react'

type Activity = {
  id: string
  start_time: string
  activity_name: string
  location: string
}

type Props = {
  dayNumber: number
  activities: Activity[]
  onReorder: (day: number, newOrder: Activity[]) => void
  onDelete: (id: string) => void
  onEdit: (activity: any) => void // <--- NEW PROP
}

export default function DraggableActivityList({ dayNumber, activities, onReorder, onDelete, onEdit }: Props) {
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(activities)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(dayNumber, items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`day-${dayNumber}`}>
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="space-y-4 border-l-2 border-blue-100 ml-4 pl-6 relative min-h-[50px]"
          >
            {activities.map((activity, index) => (
              <Draggable key={activity.id} draggableId={activity.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      bg-white p-4 rounded-2xl shadow-sm border group transition-all relative flex gap-3 items-center
                      ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 border-blue-200 z-50' : 'border-transparent hover:border-blue-100'}
                    `}
                    style={provided.draggableProps.style}
                  >
                    
                    {/* Drag Handle */}
                    <div {...provided.dragHandleProps} className="text-gray-300 hover:text-blue-400 cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} />
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-white border-4 border-blue-200 shadow-sm" />

                    {/* Content */}
                    <div className="flex-1 cursor-default">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                        <Clock size={12} /> {activity.start_time}
                      </div>
                      <h4 className="font-bold text-cozy-text">{activity.activity_name}</h4>
                      {activity.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {activity.location}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onEdit(activity)}
                        className="text-gray-300 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Activity"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      <button 
                        onClick={() => onDelete(activity.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Delete Activity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}