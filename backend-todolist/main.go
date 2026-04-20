package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"backend-todolist/config"
	"backend-todolist/handler"
	"backend-todolist/repository"
	"backend-todolist/service"
)

func main() {
	db := config.NewDB()
	defer db.Close()

	taskRepo := repository.NewPostgresRepo(db)
	taskService := service.NewTaskService(taskRepo)
	taskHandler := handler.NewTaskHandler(taskService)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/tasks", taskHandler.CreateTask)
	r.Get("/tasks", taskHandler.GetTasks)
	r.Get("/tasks/{id}", taskHandler.GetTaskByID)
	r.Put("/tasks/{id}", taskHandler.UpdateTask)
	r.Delete("/tasks/{id}", taskHandler.DeleteTask)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}