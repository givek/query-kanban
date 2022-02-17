import { HStack } from '@chakra-ui/react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { QueryCache, useMutation, useQuery, useQueryClient } from 'react-query';
import Column from './Column';

function fetchColumns() {
  return axios.get(`http://127.0.0.1:8000/api/MeowSpace/Tuna/columns/`);
  // .then(response => response.data);
}
function Kanban() {
  const query = useQuery('columns', fetchColumns);
  const queryClient = useQueryClient();
  const reorderTasks = useMutation(
    newOrder =>
      axios.post(`http://127.0.0.1:8000/api/reorder-tasks/`, newOrder),
    {
      // onSuccess: data => {
      //   const columns = data?.data.columns;
      //   const tasks = data?.data.tasks;

      //   queryClient.setQueriesData('columns', oldQueryData => {
      //     return { ...oldQueryData, data: [...columns] };
      //   });
      //   queryClient.setQueriesData(['tasks', 1], oldQueryData => {
      //     return { ...oldQueryData, data: [...tasks] };
      //   });
      // },

      onMutate: async newOrder => {
        await queryClient.cancelQueries('columns');
        await queryClient.cancelQueries(['tasks', 1]);

        queryClient.setQueryData('columns', oldColumnsData => {
          if (
            newOrder.source_droppable_id === newOrder.destination_droppable_id
          ) {
            console.log(oldColumnsData.data);
            const columnIndex = oldColumnsData.data.findIndex(
              col => col.id === newOrder.source_droppable_id
            );
            const column = oldColumnsData.data[columnIndex];

            const newTaskIds = Array.from(column.tasks);

            // move the taskId from its old index to its new index.

            // from the index(source.index) remove one item.
            newTaskIds.splice(newOrder.source_index, 1);

            // from destination index remove nothing and insert draggableId.
            newTaskIds.splice(newOrder.destination_index, 0, newOrder.task_id);

            // create new column
            const newColumn = { ...column, tasks: newTaskIds };

            console.log('newCol', newColumn);

            const newData = [...oldColumnsData.data];

            newData.splice(columnIndex, 1, newColumn);

            console.log(newData);

            return {
              ...oldColumnsData,
              data: newData,
            };
          } else {
            console.log(oldColumnsData.data);
            const startColumnIndex = oldColumnsData.data.findIndex(
              col => col.id === newOrder.source_droppable_id
            );
            const endColumnIndex = oldColumnsData.data.findIndex(
              col => col.id === newOrder.destination_droppable_id
            );

            const startColumn = oldColumnsData.data[startColumnIndex];
            const endColumn = oldColumnsData.data[endColumnIndex];

            const startTaskIds = Array.from(startColumn.tasks);

            // remove the dragged task from startTaskIds
            startTaskIds.splice(newOrder.source_index, 1);

            // create copy of taskIds array of end column
            const endTaskIds = Array.from(endColumn.tasks);

            // add the dropped task to endTaskIds
            endTaskIds.splice(newOrder.destination_index, 0, newOrder.task_id);

            const newStartColumn = { ...startColumn, tasks: startTaskIds };
            const newEndColumn = { ...endColumn, tasks: endTaskIds };

            const newData = [...oldColumnsData.data];

            newData.splice(startColumnIndex, 1, newStartColumn);
            newData.splice(endColumnIndex, 1, newEndColumn);

            console.log('newData', newData);
            return {
              ...oldColumnsData,
              data: newData,
            };
          }
        });
      },
      onError: (_error, _newOrder, context) => {
        queryClient.setQueriesData('columns', context.oldColumnsData);
      },
      onSettled: () => {
        queryClient.invalidateQueries('columns');
        queryClient.invalidateQueries(['tasks', 1]);
      },
    }
  );

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  function onDragEnd(result) {
    // console.log('ondragend');

    // console.log('result', result);

    const { destination, source, draggableId } = result;

    console.log(result);

    if (!destination) {
      return;
    }

    // the location of the draggable was not changed.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // console.log('source.index', source.index);
    // console.log('destination.index', destination.index);
    reorderTasks.mutate({
      source_index: source.index,
      source_droppable_id: parseInt(source.droppableId.slice(-1)),
      destination_index: destination.index,
      destination_droppable_id: parseInt(destination.droppableId.slice(-1)),
      task_id: parseInt(draggableId.slice(5)),
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HStack spacing={8} alignItems="flex-start" padding={6}>
        {query.data?.data.map(column => (
          <Column key={column.id} column={column} />
        ))}
      </HStack>
    </DragDropContext>
  );
}
export default Kanban;
