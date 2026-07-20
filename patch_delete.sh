sed -i "s/onClick={() => onDelete(app.id)}/onClick={() => { onDelete(app.id); alert('App deleted successfully!'); }}/g" src/App.tsx
sed -i "s/onClick={() => onDeleteUser(user.id)}/onClick={() => { onDeleteUser(user.id); alert('User deleted successfully!'); }}/g" src/App.tsx
