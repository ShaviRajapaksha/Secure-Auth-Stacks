using AuthLearningApi.Data;
using AuthLearningApi.DTOs;
using AuthLearningApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthLearningApi.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(
        AppDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (existingUser != null)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = email,
            Role = Role.USER
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        return CreateAuthResponse(user);
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = _jwtService.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}