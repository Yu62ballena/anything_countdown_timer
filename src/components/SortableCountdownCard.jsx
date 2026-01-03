import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CountdownCard from './CountdownCard';
import { GripVertical } from 'lucide-react';

const SortableCountdownCard = ({ event, displayMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: event.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : 1,
        touchAction: 'none' // Important for mobile DnD
    };

    return (
        <div ref={setNodeRef} style={style} className="sortable-card-wrapper">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="drag-handle"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    cursor: 'grab',
                    zIndex: 10,
                    padding: '5px',
                    color: '#ccc'
                }}
            >
                <GripVertical size={20} />
            </div>

            <CountdownCard event={event} displayMode={displayMode} />
        </div>
    );
};

export default SortableCountdownCard;
