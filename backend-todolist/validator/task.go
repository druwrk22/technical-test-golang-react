package validator

import (
	"errors"
	"time"
	"backend-todolist/domain"
)

const dateLayout = "2006-01-02"

func ValidateCreateTask(req *domain.CreateTaskRequest) error {
	if req.Title == "" {
		return errors.New("title is required")
	}
	
	if req.Description == "" {
		return errors.New("description is required")
	}
	
	if req.DueDate == "" {
        return errors.New("due_date is required")
    }

    if _, err := time.Parse(dateLayout, req.DueDate); err != nil {
        return errors.New("due_date must be in YYYY-MM-DD format")
    }

    today := time.Now().Format(dateLayout)
    if req.DueDate < today {
        return errors.New("due_date must be in the future")
    }

	return validateCommonFields(req)
}

func ValidateUpdateTask(req *domain.CreateTaskRequest) error {
	return ValidateCreateTask(req)
}

func validateCommonFields(req *domain.CreateTaskRequest) error {
    if req.Status != "" && req.Status != "pending" && req.Status != "completed" {
        return errors.New("status must be 'pending' or 'completed'")
    }
    return nil
}