package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBArticles;
import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.repositories.UCSBArticlesRepository;
import edu.ucsb.cs156.example.repositories.UCSBDateRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = UCSBArticleController.class)
@Import(TestConfig.class)
public class UCSBArticlesControllerTests extends ControllerTestCase {
    @MockBean
    UCSBArticlesRepository ucsbArticlesRepository;

    @MockBean
    UserRepository userRepository;

    // Tests for GET /api/recommendationrequest/all
    
    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/articles/all")).andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
        mockMvc.perform(get("/api/articles/all"))
                        .andExpect(status().is(200)); // logged
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_can_get_all_recrequests() throws Exception {

            // arrange
            LocalDateTime ldt0 = LocalDateTime.parse("2022-01-03T00:00:00");

            UCSBArticles ucsbArticles1 = UCSBArticles.builder()
                            .title("UCSB")
                            .url("https://www.ucsb.edu/")
                            .explanation("UCSB Website")
                            .email("omar@ucsb.edu")
                            .dateAdded(ldt0)
                            .build();

            LocalDateTime ldt1 = LocalDateTime.parse("2022-03-11T00:00:00");

            UCSBArticles ucsbArticles2 = UCSBArticles.builder()
                            .title("UCSB")
                            .url("https://www.ucsb.edu/")
                            .explanation("UCSB Website")
                            .email("omar@ucsb.edu")
                            .dateAdded(ldt1)
                            .build();

            ArrayList<UCSBArticles> exceptedUcsbArticles = new ArrayList<>();
            exceptedUcsbArticles.addAll(Arrays.asList(ucsbArticles1, ucsbArticles2));

            when(ucsbArticlesRepository.findAll()).thenReturn(exceptedUcsbArticles);

            // act
            MvcResult response = mockMvc.perform(get("/api/articles/all"))
                            .andExpect(status().isOk()).andReturn();

            // assert

            verify(ucsbArticlesRepository, times(1)).findAll();
            String expectedJson = mapper.writeValueAsString(exceptedUcsbArticles);
            String responseString = response.getResponse().getContentAsString();
            assertEquals(expectedJson, responseString);
    }

    // Tests for POST /api/recommendationrequest/post...

    @Test
    public void logged_out_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/articles/post"))
                            .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/articles/post"))
                            .andExpect(status().is(403)); // only admins can post
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void an_admin_user_can_post_a_new_recrequest() throws Exception {
            // arrange

            LocalDateTime ldt0 = LocalDateTime.parse("2022-01-03T00:00:00");

            UCSBArticles ucsbArticles1 = UCSBArticles.builder()
                            .title("UCSB")
                            .url("https://www.ucsb.edu/")
                            .explanation("UCSB Website")
                            .email("omar@ucsb.edu")
                            .dateAdded(ldt0)
                            .build();

            when(ucsbArticlesRepository.save(eq(ucsbArticles1))).thenReturn(ucsbArticles1);

            // act
            MvcResult response = mockMvc.perform(
                            post("/api/articles/post?title=UCSB&url=https://www.ucsb.edu/&explanation=UCSB Website&email=omar@ucsb.edu&dateAdded=2022-01-03T00:00:00")
                                            .with(csrf()))
                            .andExpect(status().isOk()).andReturn();

            // assert
            verify(ucsbArticlesRepository, times(1)).save(ucsbArticles1);
            String expectedJson = mapper.writeValueAsString(ucsbArticles1);
            String responseString = response.getResponse().getContentAsString();
            assertEquals(expectedJson, responseString);
    }

    // Tests for GET /api/ucsbdates?id=...

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
            mockMvc.perform(get("/api/articles?id=7"))
                            .andExpect(status().is(403)); // logged out users can't get by id
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

        // arrange
        LocalDateTime ldt0 = LocalDateTime.parse("2022-01-03T00:00:00");

        UCSBArticles ucsbArticles1 = UCSBArticles.builder()
                        .title("UCSB")
                        .url("https://www.ucsb.edu/")
                        .explanation("UCSB Website")
                        .email("omar@ucsb.edu")
                        .dateAdded(ldt0)
                        .build();

        when(ucsbArticlesRepository.findById(eq(7L))).thenReturn(Optional.of(ucsbArticles1));

        // act
        MvcResult response = mockMvc.perform(get("/api/articles?id=7"))
                        .andExpect(status().isOk()).andReturn();

        // assert

        verify(ucsbArticlesRepository, times(1)).findById(eq(7L));
        String expectedJson = mapper.writeValueAsString(ucsbArticles1);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(ucsbArticlesRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/articles?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(ucsbArticlesRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("UCSBArticles with id 7 not found", json.get("message"));
        }

        // Tests for DELETE /api/ucsbdates?id=... 
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_a_rec_request() throws Exception {
                // arrange

                LocalDateTime ldt0 = LocalDateTime.parse("2022-01-03T00:00:00");

                UCSBArticles ucsbArticles1 = UCSBArticles.builder()
                                .title("UCSB")
                                .url("https://www.ucsb.edu/")
                                .explanation("UCSB Website")
                                .email("omar@ucsb.edu")
                                .dateAdded(ldt0)
                                .build();

                when(ucsbArticlesRepository.findById(eq(15L))).thenReturn(Optional.of(ucsbArticles1));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/articles?id=15")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(ucsbArticlesRepository, times(1)).findById(15L);
                verify(ucsbArticlesRepository, times(1)).delete(any());

                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBArticles with id 15 deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_recommendationrequest_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(ucsbArticlesRepository.findById(eq(15L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/articles?id=15")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(ucsbArticlesRepository, times(1)).findById(15L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBArticles with id 15 not found", json.get("message"));
        }


        // Tests for PUT /api/articles?id=... 

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_recrequest() throws Exception {
                // arrange

                LocalDateTime ldt0 = LocalDateTime.parse("2022-01-03T00:00:00");

                UCSBArticles ucsbArticlesOrigin = UCSBArticles.builder()
                                .title("UCSB")
                                .url("https://www.ucsb.edu/")
                                .explanation("UCSB Website")
                                .email("omar@ucsb.edu")
                                .dateAdded(ldt0)
                                .build();

                LocalDateTime ldt1 = LocalDateTime.parse("2022-03-11T00:00:00");

                UCSBArticles ucsbArticlesEdited = UCSBArticles.builder()
                                .title("Google")
                                .url("https://www.google.com/?gws_rd=ssl")
                                .explanation("Google Site")
                                .email("vedantshah@ucsb.edu")
                                .dateAdded(ldt1)
                                .build();

                String requestBody = mapper.writeValueAsString(ucsbArticlesEdited);

                when(ucsbArticlesRepository.findById(eq(67L))).thenReturn(Optional.of(ucsbArticlesOrigin));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/articles?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(ucsbArticlesRepository, times(1)).findById(67L);
                verify(ucsbArticlesRepository, times(1)).save(ucsbArticlesEdited); // should be saved with correct user
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }


        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_recrequest_that_does_not_exist() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-03-11T00:00:00");

                UCSBArticles ucsbArticlesEdited = UCSBArticles.builder()
                                .title("Google")
                                .url("https://www.google.com/?gws_rd=ssl")
                                .explanation("Google Site")
                                .email("vedantshah@ucsb.edu")
                                .dateAdded(ldt1)
                                .build();

                String requestBody = mapper.writeValueAsString(ucsbArticlesEdited);

                when(ucsbArticlesRepository.findById(eq(67L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/articles?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(ucsbArticlesRepository, times(1)).findById(67L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("UCSBArticles with id 67 not found", json.get("message"));

        }

}
