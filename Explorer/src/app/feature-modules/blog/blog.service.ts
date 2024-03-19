import { Injectable } from '@angular/core';
import { BlogComment } from './model/blog-comment.model';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Blog, BlogStatus } from './model/blog.model';
import { environment } from 'src/env/environment';
import { Observable, map } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Rating } from './model/blog-rating.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }

  getBlogComment(): Observable<PagedResults<BlogComment>> {
    return this.http.get<PagedResults<BlogComment>>(environment.apiHost + 'tourist/comment')
  }

  deleteBlogComment(id: number): Observable<BlogComment> {
    return this.http.delete<BlogComment>(environment.apiHost + 'tourist/comment/' + id);
  }

  addBlogComment(comment: BlogComment): Observable<BlogComment> {
    return this.http.post<BlogComment>(environment.apiHost + 'tourist/comment', comment);
  }

  updateBlogComment(comment: BlogComment): Observable<BlogComment> {
    return this.http.put<BlogComment>(environment.apiHost + 'tourist/comment/' + comment.id, comment);
  }

  getBlogs1(): Observable<Blog[]> {
    return this.http.get<Blog[]>(environment.blogHost + 'blog')
  }
  getBlogs(): Observable<PagedResults<Blog>> {
    return this.http.get<PagedResults<Blog>>(environment.blogHost + 'blog')
  }

  getBlogsByStatus(status: BlogStatus): Observable<PagedResults<Blog>> {
    return this.http.get<PagedResults<Blog>>(environment.apiHost + 'tourist/blog/byStatus/' + status)
  }

  deleteBlog(id: string): Observable<Blog> {
    return this.http.delete<Blog>(environment.blogHost + 'blog/' + id);
  }

  getBlog(id: string): Observable<Blog> {
    return this.http.get<Blog>(environment.blogHost + 'blog/' + id);
  }

  addBlog(blog: Blog): Observable<Blog> {
    return this.http.post<Blog>(environment.blogHost + 'blog', blog);
  }

  updateBlog(blog: Blog): Observable<Blog> {
    return this.http.put<Blog>(environment.blogHost + 'blog/' + blog.id, blog);
  }

  addRating(rating: Rating): Observable<any> {
    return this.http.put(environment.apiHost + 'tourist/blog/AddRating', rating);
  }

  getRatingCount(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiHost}tourist/blog/RatingCount?blogId=${id}`);
  }  
  

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', 'https://localhost:44333/api/tourist/blog/UploadFile', formData,{
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getBlogsByUserId(id: number): Observable<Blog> {
    return this.http.get<Blog>(environment.blogHost + 'blog/byUser/' + id);
  }
  getCommentsByBlogId(id: string): Observable<PagedResults<BlogComment>> {
    return this.http.get<PagedResults<BlogComment>>(environment.apiHost + 'tourist/comment/byBlog/' + id);
  }

  getSimilarBlogs(currentBlog: Blog): Observable<Blog[]> {
    return this.getBlogs().pipe(
      map((allBlogs: PagedResults<Blog>) => {
        const similarBlogs: Blog[] = [];

        const similarCategoryBlogs = allBlogs.results.filter(blog => blog.category === currentBlog.category && blog.id !== currentBlog.id);
        
        for (let i = 0; i < 4 && i < similarCategoryBlogs.length; i++) {
          similarBlogs.push(similarCategoryBlogs[i]);
        }

        return similarBlogs;
      })
    );
  }

}
