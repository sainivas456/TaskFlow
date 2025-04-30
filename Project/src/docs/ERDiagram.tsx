
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from '@/components/ui/image';

const ERDiagram = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Task Management Database Schema</h1>
      
      <Card className="mb-8 overflow-auto">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Image 
              src="/lovable-uploads/32cc6b16-162d-4280-a796-744c00e76372.png"
              alt="Complete ER Diagram"
              className="max-w-full h-auto"
              width={900}
              height={800}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold">Schema Description</h2>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Users Table</h3>
          <p>Stores user account information. Each user can have multiple tasks, labels, and categories.</p>
          <ul className="list-disc pl-8">
            <li><strong>user_id:</strong> Unique identifier for users (Primary Key)</li>
            <li><strong>username:</strong> User's display name</li>
            <li><strong>email:</strong> User's email address (unique)</li>
            <li><strong>password_hash:</strong> Securely stored password</li>
            <li><strong>created_at:</strong> Timestamp of account creation</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Tasks Table</h3>
          <p>Core table storing task information. Each task belongs to a user and can have subtasks, comments, labels, and more.</p>
          <ul className="list-disc pl-8">
            <li><strong>task_id:</strong> Unique identifier for tasks (Primary Key)</li>
            <li><strong>user_id:</strong> References the user who owns the task (Foreign Key)</li>
            <li><strong>title:</strong> Task title</li>
            <li><strong>description:</strong> Optional detailed description</li>
            <li><strong>due_date:</strong> When the task should be completed</li>
            <li><strong>status:</strong> Current state of the task (Pending, In Progress, Completed, Overdue)</li>
            <li><strong>priority:</strong> Task importance level (1-5)</li>
            <li><strong>created_at:</strong> Timestamp of task creation</li>
            <li><strong>completed_at:</strong> Timestamp when task was completed</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Sub_Tasks Table</h3>
          <p>Stores smaller tasks that make up a parent task. Helps with tracking granular progress.</p>
          <ul className="list-disc pl-8">
            <li><strong>sub_task_id:</strong> Unique identifier for subtasks (Primary Key)</li>
            <li><strong>task_id:</strong> References the parent task (Foreign Key)</li>
            <li><strong>title:</strong> Subtask description</li>
            <li><strong>status:</strong> Completion status (e.g., completed, pending)</li>
            <li><strong>created_at:</strong> Timestamp of subtask creation</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Categories Table</h3>
          <p>Stores user-specific categories for organizing tasks.</p>
          <ul className="list-disc pl-8">
            <li><strong>category_id:</strong> Unique identifier for categories (Primary Key)</li>
            <li><strong>user_id:</strong> References the user who created the category (Foreign Key)</li>
            <li><strong>category_name:</strong> Name of the category (unique per user)</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Task_Categories Junction Table</h3>
          <p>Resolves the many-to-many relationship between tasks and categories.</p>
          <ul className="list-disc pl-8">
            <li><strong>task_id:</strong> References the task (Foreign Key)</li>
            <li><strong>category_id:</strong> References the category (Foreign Key)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-medium">Labels Table</h3>
          <p>Stores user-specific tags that can be applied to tasks for organization.</p>
          <ul className="list-disc pl-8">
            <li><strong>label_id:</strong> Unique identifier for labels (Primary Key)</li>
            <li><strong>user_id:</strong> References the user who created the label (Foreign Key)</li>
            <li><strong>label_name:</strong> Label name (unique per user)</li>
            <li><strong>color_code:</strong> Visual color identifier for the label (HEX format #XXXXXX)</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Task_Labels Junction Table</h3>
          <p>Resolves the many-to-many relationship between tasks and labels.</p>
          <ul className="list-disc pl-8">
            <li><strong>task_id:</strong> References the task (Foreign Key)</li>
            <li><strong>label_id:</strong> References the label (Foreign Key)</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Shared_Tasks Table</h3>
          <p>Manages task sharing between users for collaboration.</p>
          <ul className="list-disc pl-8">
            <li><strong>shared_task_id:</strong> Unique identifier for shared tasks (Primary Key)</li>
            <li><strong>task_id:</strong> References the task being shared (Foreign Key)</li>
            <li><strong>shared_with_user_id:</strong> References the user receiving access (Foreign Key)</li>
            <li><strong>permission_level:</strong> Level of access granted (Read/Write/Admin)</li>
            <li><strong>shared_at:</strong> Timestamp when sharing occurred</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Comments Table</h3>
          <p>Stores comments made by users on tasks for collaboration and discussion.</p>
          <ul className="list-disc pl-8">
            <li><strong>comment_id:</strong> Unique identifier for comments (Primary Key)</li>
            <li><strong>task_id:</strong> References the task being commented on (Foreign Key)</li>
            <li><strong>user_id:</strong> References the user making the comment (Foreign Key)</li>
            <li><strong>comment_text:</strong> The content of the comment</li>
            <li><strong>created_at:</strong> Timestamp when comment was created</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Mentions Table</h3>
          <p>Tracks user mentions within comments for notifications.</p>
          <ul className="list-disc pl-8">
            <li><strong>mention_id:</strong> Unique identifier for mentions (Primary Key)</li>
            <li><strong>comment_id:</strong> References the comment containing the mention (Foreign Key)</li>
            <li><strong>mentioned_user_id:</strong> References the user being mentioned (Foreign Key)</li>
            <li><strong>created_at:</strong> Timestamp when mention was created</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-medium">Notifications Table</h3>
          <p>Stores system-generated notifications for users.</p>
          <ul className="list-disc pl-8">
            <li><strong>notification_id:</strong> Unique identifier for notifications (Primary Key)</li>
            <li><strong>title:</strong> Notification title</li>
            <li><strong>content:</strong> Detailed notification content</li>
            <li><strong>type:</strong> Type of notification (task, mention, system)</li>
            <li><strong>created_at:</strong> Timestamp when notification was created</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-medium">Notification_Recipients Table</h3>
          <p>Tracks which users received which notifications and their read status.</p>
          <ul className="list-disc pl-8">
            <li><strong>recipient_id:</strong> Unique identifier for notification recipient (Primary Key)</li>
            <li><strong>notification_id:</strong> References the notification (Foreign Key)</li>
            <li><strong>user_id:</strong> References the user receiving the notification (Foreign Key)</li>
            <li><strong>is_read:</strong> Boolean indicating if the notification has been read</li>
            <li><strong>read_at:</strong> Timestamp when notification was read</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Time_Entries Table</h3>
          <p>Tracks time spent on tasks for productivity analysis.</p>
          <ul className="list-disc pl-8">
            <li><strong>time_entry_id:</strong> Unique identifier for time entries (Primary Key)</li>
            <li><strong>task_id:</strong> References the associated task (Foreign Key)</li>
            <li><strong>user_id:</strong> References the user logging time (Foreign Key)</li>
            <li><strong>start_time:</strong> When work on the task began</li>
            <li><strong>end_time:</strong> When work on the task ended</li>
            <li><strong>duration:</strong> Calculated time spent</li>
            <li><strong>created_at:</strong> Timestamp when entry was created</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Attachments Table</h3>
          <p>Stores files attached to tasks.</p>
          <ul className="list-disc pl-8">
            <li><strong>attachment_id:</strong> Unique identifier for attachments (Primary Key)</li>
            <li><strong>task_id:</strong> References the associated task (Foreign Key)</li>
            <li><strong>user_id:</strong> References the user who uploaded the file (Foreign Key)</li>
            <li><strong>file_name:</strong> Original name of the uploaded file</li>
            <li><strong>file_path:</strong> Storage location of the file</li>
            <li><strong>file_size:</strong> Size of the file in bytes</li>
            <li><strong>file_type:</strong> MIME type of the file</li>
            <li><strong>uploaded_at:</strong> Timestamp when file was uploaded</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Calendar Table</h3>
          <p>Manages synchronization between tasks and external calendar services.</p>
          <ul className="list-disc pl-8">
            <li><strong>sync_id:</strong> Unique identifier for calendar sync records (Primary Key)</li>
            <li><strong>user_id:</strong> References the user account (Foreign Key)</li>
            <li><strong>task_id:</strong> References the task being synced (Foreign Key)</li>
            <li><strong>event_id:</strong> External calendar event identifier</li>
            <li><strong>sync_status:</strong> Current state of synchronization</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Task_Completion Table</h3>
          <p>Records the completion history of tasks.</p>
          <ul className="list-disc pl-8">
            <li><strong>completion_id:</strong> Unique identifier for completion records (Primary Key)</li>
            <li><strong>task_id:</strong> References the completed task (Foreign Key)</li>
            <li><strong>user_id:</strong> References the user who completed the task (Foreign Key)</li>
            <li><strong>completion_date:</strong> When the task was marked as complete</li>
            <li><strong>status:</strong> Final status at completion</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Task_Analytics Table</h3>
          <p>Stores aggregated task metrics for reporting and analysis.</p>
          <ul className="list-disc pl-8">
            <li><strong>analytics_id:</strong> Unique identifier for analytics records (Primary Key)</li>
            <li><strong>user_id:</strong> References the associated user (Foreign Key)</li>
            <li><strong>date:</strong> Date of the analytics record</li>
            <li><strong>total_tasks:</strong> Count of all tasks</li>
            <li><strong>tasks_completed:</strong> Count of completed tasks</li>
            <li><strong>tasks_not_completed_today:</strong> Count of tasks due but not completed</li>
          </ul>
        </div>
        
        <div className="space-y-2 mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-xl font-medium">Key Relationships and Advanced Behavior</h3>
          <ul className="list-disc pl-8">
            <li>A <strong>User</strong> creates many <strong>Tasks</strong>, <strong>Labels</strong>, and <strong>Categories</strong></li>
            <li>A <strong>Task</strong> can have many <strong>Sub_Tasks</strong>, <strong>Comments</strong>, and <strong>Attachments</strong></li>
            <li>A <strong>Task</strong> can have many <strong>Labels</strong> (via Task_Labels) and <strong>Categories</strong> (via Task_Categories)</li>
            <li>A <strong>Task</strong> can be shared with many <strong>Users</strong> (via Shared_Tasks) with different permission levels</li>
            <li>A <strong>Comment</strong> can have many <strong>Mentions</strong> which generate <strong>Notifications</strong></li>
            <li>A <strong>Task</strong> can have many <strong>Time_Entries</strong> to track work duration</li>
            <li>A <strong>Task</strong> can be synced with external calendars (via Calendar)</li>
            <li><strong>Stored Procedures</strong>: update_task_analytics, mark_tasks_overdue</li>
            <li><strong>Triggers</strong>: Auto-notify task owner when all subtasks are completed</li>
            <li><strong>Check Constraints</strong>: Priority values (1-5), Label colors (HEX format), Unique category/label names per user</li>
            <li><strong>Cascading Deletes</strong>: Removing users or tasks cleans up associated records automatically</li>
          </ul>
        </div>

        <div className="space-y-2 mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h3 className="text-xl font-medium">Frontend Implementation Status</h3>
          <p>Current frontend implementation status relative to the backend schema:</p>
          <ul className="list-disc pl-8">
            <li><strong>Fully Implemented:</strong> Users, Tasks, Labels</li>
            <li><strong>Partially Implemented:</strong> Calendar integration, Sub_Tasks</li>
            <li><strong>To Be Implemented:</strong> Comments, Mentions, Time_Entries, Attachments, Shared_Tasks, Categories, Notifications, Task_Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ERDiagram;
