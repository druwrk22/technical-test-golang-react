package validator

import (
	"errors"
	"time"
	"backend-todolist/domain"
)

func ValidateCreateTask(req *domain.CreateTaskRequest) error {
	if req.Title == "" {
		return errors.New("title is required")
	}
	if req.DueDate == "" {
		return errors.New("due_date is required")
	}
	return validateCommonFields(req)
}

func ValidateUpdateTask(req *domain.CreateTaskRequest) error {
	return validateCommonFields(req)
}

func validateCommonFields(req *domain.CreateTaskRequest) error {
	if req.Status != "" && req.Status != "pending" && req.Status != "completed" {
		return errors.New("status must be 'pending' or 'completed'")
	}
	if req.DueDate != "" {
		if _, err := time.Parse("2006-01-02", req.DueDate); err != nil {
			return errors.New("due_date must be in YYYY-MM-DD format")
		}
	}
	return nil
}