import { Task } from "@/types/task";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'task';
  priority: Task['priority'];
  status: Task['status'];
  created_by: string;
  assigned_to: string;
}

interface EventListProps {
  selectedDate: Date | undefined;
  events: Event[];
}

export const EventList = ({ selectedDate, events }: EventListProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedDate 
            ? `Events for ${format(selectedDate, 'MMMM d, yyyy')}` 
            : 'Upcoming Events'}
        </h2>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No events for this date</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg transition-all hover:shadow-md border-l-4 ${
                event.priority === 'high' 
                  ? 'border-l-red-500 bg-red-50' 
                  : event.priority === 'medium' 
                    ? 'border-l-yellow-500 bg-yellow-50' 
                    : 'border-l-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-white shadow-sm border">
                  Task
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Due {format(event.date, 'h:mm a')}
              </p>
              <div className="mt-3 space-y-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.status === 'completed' ? 'bg-green-100 text-green-800' :
                  event.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created by:</span> {event.created_by}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Assigned to:</span> {event.assigned_to}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};