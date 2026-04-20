package service

import (
	"context"
	"database/sql"
	"math"

	"backend-todolist/domain"
	"backend-todolist/repository"
	"backend-todolist/validator"
)

type TaskService interface {
	CreateTask(ctx context.Context, req *domain.CreateTaskRequest) (*domain.Task, error)
	GetTasks(ctx context.Context, status, search string, page, limit int) ([]domain.Task, *domain.Pagination, error)
	GetTaskByID(ctx context.Context, id string) (*domain.Task, error)
	UpdateTask(ctx context.Context, id string, req *domain.CreateTaskRequest) (*domain.Task, error)
	DeleteTask(ctx context.Context, id string) error
}

type taskService struct {
	repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return &taskService{repo: repo}
}

func (s *taskService) CreateTask(ctx context.Context, req *domain.CreateTaskRequest) (*domain.Task, error) {
	if err := validator.ValidateCreateTask(req); err != nil {
		return nil, err
	}
	status := req.Status
	if status == "" { status = "pending" }

	task := &domain.Task{
		Title:       req.Title,
		Description: req.Description,
		Status:      status,
		DueDate:     req.DueDate,
	}
	return task, s.repo.Create(ctx, task)
}

func (s *taskService) GetTasks(ctx context.Context, status, search string, page, limit int) ([]domain.Task, *domain.Pagination, error) {
	tasks, total, err := s.repo.GetAll(ctx, status, search, page, limit)
	if err != nil { return nil, nil, err }

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return tasks, &domain.Pagination{
		CurrentPage: page,
		TotalPages:  totalPages,
		TotalTasks:  total,
	}, nil
}

func (s *taskService) GetTaskByID(ctx context.Context, id string) (*domain.Task, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *taskService) UpdateTask(ctx context.Context, id string, req *domain.CreateTaskRequest) (*domain.Task, error) {
	if err := validator.ValidateUpdateTask(req); err != nil {
		return nil, err
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil { return nil, err }
	if existing == nil { return nil, sql.ErrNoRows }

	if req.Title != "" { existing.Title = req.Title }
	if req.Description != "" { existing.Description = req.Description }
	if req.Status != "" { existing.Status = req.Status }
	if req.DueDate != "" { existing.DueDate = req.DueDate }

	err = s.repo.Update(ctx, existing)
	return existing, err
}

func (s *taskService) DeleteTask(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}