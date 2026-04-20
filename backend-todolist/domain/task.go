package domain

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"due_date"`
}

type CreateTaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"due_date"`
}

type Pagination struct {
	CurrentPage int `json:"current_page"`
	TotalPages  int `json:"total_pages"`
	TotalTasks  int `json:"total_tasks"`
}

type GetAllTasksResponse struct {
	Tasks      []Task     `json:"tasks"`
	Pagination Pagination `json:"pagination"`
}

type TaskResponse struct {
	Message string `json:"message"`
	Task    Task   `json:"task"`
}