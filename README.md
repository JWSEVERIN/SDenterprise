# Enterprise CRUD

Simple Node.js + Express CRUD demo with a file-backed JSON store.

Quick start:

```bash
cd /home/os/SOFTDEV/DASHBOARD/enterprise-crud
npm install
npm start
```

Open http://localhost:3000/employees.html

API examples:

- List: curl -sS http://localhost:3000/api/employees | jq
	- Paginated: curl -sS 'http://localhost:3000/api/employees?page=2&per_page=5' | jq
		- Services example: curl -sS -X POST http://localhost:3000/api/services -H 'Content-Type: application/json' -d '{"name":"Support","category":"IT","price":99.95,"description":"Standard support"}' | jq
- Create: curl -sS -X POST http://localhost:3000/api/employees -H 'Content-Type: application/json' -d '{"name":"Alice","title":"Engineer","email":"alice@example.com"}' | jq
- Update: curl -sS -X PUT http://localhost:3000/api/employees/1 -H 'Content-Type: application/json' -d '{"title":"Senior"}' | jq
- Delete: curl -sS -X DELETE http://localhost:3000/api/employees/1 -v
