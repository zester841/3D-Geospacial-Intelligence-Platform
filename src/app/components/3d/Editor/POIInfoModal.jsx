'use client';
import Button from '../UI/Button';

const POIInfoModal = ({ poi, onClose, onEdit, onDelete }) => {
  return (
    <div className="space-y-3 bg-gray-900">
      <h3 className="font-bold text-lg">{poi.name}</h3>
      <p className="text-gray-600">{poi.description || 'No description'}</p>
      
      <div className="flex flex-wrap gap-1">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {poi.type}
        </span>
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          X: {poi.position.x.toFixed(2)}
        </span>
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          Y: {poi.position.y.toFixed(2)}
        </span>
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          Z: {poi.position.z.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="danger" onClick={onDelete} size="sm">
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>
          <Button onClick={onEdit} size="sm">
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POIInfoModal;