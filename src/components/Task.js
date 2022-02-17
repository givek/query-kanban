import { Box, Text, HStack, Avatar, Tag, TagLabel } from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';

function Task({ task, index }) {
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <Box
          borderTop="8px"
          borderStyle="solid"
          borderColor="red.400"
          borderRadius="md"
          py={2}
          px={4}
          fontSize="14px"
          boxShadow="md"
          bgColor={snapshot.isDragging ? 'blue.50' : 'white'}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Text fontWeight="medium">{task.name}</Text>
          <HStack my={2} alignItems="center">
            <Avatar name={task.reporter} size="xs" />
            <Text fontSize="12px">Aug 18 - 20</Text>
          </HStack>
          <Tag
            size="sm"
            my={1}
            py={1}
            px={2}
            variant="subtle"
            colorScheme="red"
          >
            <TagLabel fontSize={9}>Frontend</TagLabel>
          </Tag>
        </Box>
      )}
    </Draggable>
  );
}

export default Task;
