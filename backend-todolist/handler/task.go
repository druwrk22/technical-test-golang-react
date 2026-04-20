package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"backend-todolist/domain"
	"backend-todolist/service"
)

type TaskHandler struct {
	svc service.TaskService
}

func NewTaskHandler(svc service.TaskService) *TaskHandler {
	return &TaskHandler{svc: svc}
}

func (h *TaskHandler) respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func (h *TaskHandler) respondError(w http.ResponseWriter, status int, msg string) {
	h.respondJSON(w, status, map[string]string{"error": msg})
}

func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	task, err := h.svc.CreateTask(r.Context(), &req)
	if err != nil {
		h.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondJSON(w, http.StatusCreated, domain.TaskResponse{Message: "Task created successfully", Task: *task})
}

func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 { page = 1 }
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit < 1 { limit = 10 }

	tasks, pagination, err := h.svc.GetTasks(r.Context(), q.Get("status"), q.Get("search"), page, limit)
	if err != nil {
		h.respondError(w, http.StatusInternalServerError, "Failed to fetch tasks")
		return
	}

	h.respondJSON(w, http.StatusOK, domain.GetAllTasksResponse{Tasks: tasks, Pagination: *pagination})
}

func (h *TaskHandler) GetTaskByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	task, err := h.svc.GetTaskByID(r.Context(), id)
	if err != nil {
		h.respondError(w, http.StatusInternalServerError, "Database error")
		return
	}
	if task == nil {
		h.respondError(w, http.StatusNotFound, "Task not found")
		return
	}
	h.respondJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req domain.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	task, err := h.svc.UpdateTask(r.Context(), id, &req)
	if err != nil {
		if err == sql.ErrNoRows {
			h.respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		h.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondJSON(w, http.StatusOK, domain.TaskResponse{Message: "Task updated successfully", Task: *task})
}

func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteTask(r.Context(), id); err != nil {
		if err == sql.ErrNoRows {
			h.respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		h.respondError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}
	h.respondJSON(w, http.StatusOK, map[string]string{"message": "Task deleted successfully"})
}