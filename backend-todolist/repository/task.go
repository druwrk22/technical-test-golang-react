package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"
	"backend-todolist/domain"
)

type TaskRepository interface {
	Create(ctx context.Context, task *domain.Task) error
	GetAll(ctx context.Context, status, search string, page, limit int) ([]domain.Task, int, error)
	GetByID(ctx context.Context, id string) (*domain.Task, error)
	Update(ctx context.Context, task *domain.Task) error
	Delete(ctx context.Context, id string) error
}

type postgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) TaskRepository {
	return &postgresRepo{db: db}
}

func (r *postgresRepo) Create(ctx context.Context, t *domain.Task) error {
	t.ID = uuid.New().String()
	q := `INSERT INTO tasks (id, title, description, status, due_date) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, q, t.ID, t.Title, t.Description, t.Status, t.DueDate)
	return err
}

func (r *postgresRepo) GetAll(ctx context.Context, status, search string, page, limit int) ([]domain.Task, int, error) {
	var conditions []string
	var args []any
	idx := 1

	if status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", idx))
		args = append(args, status)
		idx++
	}
	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(LOWER(title) LIKE $%d OR LOWER(description) LIKE $%d)", idx, idx+1))
		p := "%" + strings.ToLower(search) + "%"
		args = append(args, p, p)
		idx += 2
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	g, ctx := errgroup.WithContext(ctx)
	var tasks []domain.Task
	var total int

	g.Go(func() error {
		q := fmt.Sprintf("SELECT COUNT(*) FROM tasks %s", where)
		return r.db.QueryRowContext(ctx, q, args...).Scan(&total)
	})

	g.Go(func() error {
		offset := (page - 1) * limit
		fetchArgs := append(args, limit, offset)
		q := fmt.Sprintf("SELECT id, title, description, status, due_date FROM tasks %s ORDER BY due_date DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
		rows, err := r.db.QueryContext(ctx, q, fetchArgs...)
		if err != nil { return err }
		defer rows.Close()
		for rows.Next() {
			var t domain.Task
			if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.DueDate); err != nil { return err }
			tasks = append(tasks, t)
		}
		return rows.Err()
	})

	if err := g.Wait(); err != nil {
		return nil, 0, err
	}
	if tasks == nil { tasks = []domain.Task{} }
	return tasks, total, nil
}

func (r *postgresRepo) GetByID(ctx context.Context, id string) (*domain.Task, error) {
	t := &domain.Task{}
	q := "SELECT id, title, description, status, due_date FROM tasks WHERE id = $1"
	err := r.db.QueryRowContext(ctx, q, id).Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.DueDate)
	if err == sql.ErrNoRows { return nil, nil }
	if err != nil { return nil, err }
	return t, nil
}

func (r *postgresRepo) Update(ctx context.Context, t *domain.Task) error {
	q := `UPDATE tasks SET title = $1, description = $2, status = $3, due_date = $4, updated_at = NOW() WHERE id = $5`
	res, err := r.db.ExecContext(ctx, q, t.Title, t.Description, t.Status, t.DueDate, t.ID)
	if err != nil { return err }
	rows, _ := res.RowsAffected()
	if rows == 0 { return sql.ErrNoRows }
	return nil
}

func (r *postgresRepo) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM tasks WHERE id = $1", id)
	if err != nil { return err }
	rows, _ := res.RowsAffected()
	if rows == 0 { return sql.ErrNoRows }
	return nil
}